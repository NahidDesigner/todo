// Admin Services - Firestore operations and subscriptions

class AdminServices {
	constructor(app) {
		this.app = app;
		this.notificationsUnsub = null;
	}

	// Users
	async loadUsers() {
		const snapshot = await db.collection('users').get();
		return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	}

	async addUserProfile(userData) {
		// Client apps cannot create Firebase Auth users for others.
		// We only create a profile document; assignment will only list users with a valid uid.
		const docRef = await db.collection('users').add({
			...userData,
			createdAt: new Date().toISOString(),
			status: 'invited',
			uid: userData.uid || null
		});
		return docRef.id;
	}

	async deleteUser(userId) {
		await db.collection('users').doc(userId).delete();
	}

	// Assigned tasks
	async loadAssignedTasks(limit = 20) {
		const snapshot = await db.collection('assignedTasks')
			.orderBy('createdAt', 'desc')
			.limit(limit)
			.get();
		const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
		// Sort: dueDate asc (empty last), then createdAt desc
		return tasks.sort((a, b) => {
			const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
			const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
			if (aDue !== bDue) return aDue - bDue;
			return new Date(b.createdAt) - new Date(a.createdAt);
		});
	}

	async assignTask(taskData) {
		// Persist assigned task
		const docRef = await db.collection('assignedTasks').add({ ...taskData, assignedTaskId: undefined });
		const taskId = docRef.id;
		// Add into user's todos subcollection if we have a uid
		if (taskData.assignedTo) {
			await db.collection('users').doc(taskData.assignedTo)
				.collection('todos').doc(taskId).set({ ...taskData, id: taskId, assignedTaskId: taskId }, { merge: true });
		}
		// Notify assignee only if they have an account (uid)
		if (taskData.assignedTo) {
			await this.createNotification({
				userId: taskData.assignedTo,
				title: 'New Task Assigned',
				message: `You have been assigned: ${taskData.title}`,
				type: 'task_assigned',
				taskId: taskId,
				createdAt: new Date().toISOString(),
				read: false
			});
		}
		// Team activity
		await db.collection('teamActivity').add({
			type: 'task_assigned',
			message: `${this.app.currentUser?.email || 'Admin'} assigned "${taskData.title}"`,
			taskId: taskId,
			userId: taskData.assignedTo || taskData.assignedProfileId,
			createdAt: new Date().toISOString()
		});
		return taskId;
	}

	async updateAssignedTask(taskId, update) {
		// Update assigned task doc
		await db.collection('assignedTasks').doc(taskId).set(update, { merge: true });
		// If assigned to a user account, upsert into user's todos and dedupe old entries
		if (update.assignedTo) {
			const userTodos = db.collection('users').doc(update.assignedTo).collection('todos');
			await userTodos.doc(taskId).set({ ...update, id: taskId, assignedTaskId: taskId }, { merge: true });
			// Delete any duplicate todos with same assignedTaskId but different id
			const dupSnap = await userTodos.where('assignedTaskId', '==', taskId).get();
			for (const d of dupSnap.docs) {
				if (d.id !== taskId) {
					try { await userTodos.doc(d.id).delete(); } catch (_) {}
				}
			}
			// Notify assignee
			await db.collection('notifications').add({
				userId: update.assignedTo,
				title: 'Assigned Task Updated',
				message: `${update.title || 'Task'} was updated by admin`,
				type: 'task_updated',
				taskId: taskId,
				createdAt: new Date().toISOString(),
				read: false
			});
		}
	}

	async deleteAssignedTask(task) {
		const taskId = task.id;
		await db.collection('assignedTasks').doc(taskId).delete();
		if (task.assignedTo) {
			const userTodos = db.collection('users').doc(task.assignedTo).collection('todos');
			try { await userTodos.doc(taskId).delete(); } catch (_) {}
			// Delete any duplicates by assignedTaskId
			const dupSnap = await userTodos.where('assignedTaskId', '==', taskId).get();
			for (const d of dupSnap.docs) {
				try { await userTodos.doc(d.id).delete(); } catch (_) {}
			}
			await db.collection('notifications').add({
				userId: task.assignedTo,
				title: 'Assigned Task Removed',
				message: `${task.title || 'Task'} was removed by admin`,
				type: 'task_removed',
				taskId: taskId,
				createdAt: new Date().toISOString(),
				read: false
			});
		}
	}

	// Team activity
	async loadTeamActivity(limit = 20) {
		const snapshot = await db.collection('teamActivity')
			.orderBy('createdAt', 'desc')
			.limit(limit)
			.get();
		return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	}

	async loadAdminStats() {
		const [usersSnapshot, tasksSnapshot, completedTasksSnapshot] = await Promise.all([
			db.collection('users').get(),
			db.collection('assignedTasks').where('completed', '==', false).get(),
			db.collection('assignedTasks').where('completed', '==', true).get()
		]);
		return {
			totalUsers: usersSnapshot.size,
			activeTasks: tasksSnapshot.size,
			completedTasks: completedTasksSnapshot.size,
			pendingTasks: tasksSnapshot.size
		};
	}

	// Notifications
	async createNotification(notificationData) {
		await db.collection('notifications').add(notificationData);
	}

	async loadNotificationsFor(userId, limit = 10) {
		const snapshot = await db.collection('notifications')
			.where('userId', '==', userId)
			.orderBy('createdAt', 'desc')
			.limit(limit)
			.get();
		return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	}

	subscribeNotifications(userId, onUpdate, limit = 10) {
		if (!userId) return () => {};
		if (this.notificationsUnsub) {
			try { this.notificationsUnsub(); } catch (_) {}
		}
		this.notificationsUnsub = db.collection('notifications')
			.where('userId', '==', userId)
			.orderBy('createdAt', 'desc')
			.limit(limit)
			.onSnapshot((snapshot) => {
				const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
				onUpdate(notifications);
			}, (error) => {
				console.error('Error subscribing to notifications:', error);
			});
		return this.notificationsUnsub;
	}
}

window.AdminServices = AdminServices;