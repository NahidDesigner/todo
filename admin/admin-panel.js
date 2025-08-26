// Admin Panel - UI controller built on AdminServices

class AdminPanel {
	constructor(app) {
		this.app = app;
		this.services = new window.AdminServices(app);
		this.users = [];
		this.assignedTasks = [];
		this.teamActivity = [];
		this.notifications = [];
		this.init();
	}

	init() {
		this.setupEventListeners();
		this.refreshAll();
	}

	setupEventListeners() {
		document.getElementById('admin-toggle')?.addEventListener('click', () => this.toggleAdminPanel());
		document.getElementById('add-user-btn')?.addEventListener('click', () => this.openUserModal());
		document.getElementById('assign-task-btn')?.addEventListener('click', () => this.openAssignTaskModal());

		document.getElementById('close-user-modal')?.addEventListener('click', () => this.closeUserModal());
		document.getElementById('cancel-user')?.addEventListener('click', () => this.closeUserModal());
		document.getElementById('user-form')?.addEventListener('submit', (e) => this.handleUserSubmit(e));

		document.getElementById('close-assign-task-modal')?.addEventListener('click', () => this.closeAssignTaskModal());
		document.getElementById('cancel-assign-task')?.addEventListener('click', () => this.closeAssignTaskModal());
		document.getElementById('assign-task-form')?.addEventListener('submit', (e) => this.handleAssignTaskSubmit(e));

		document.getElementById('notifications-btn')?.addEventListener('click', () => this.toggleNotifications());
	}

	async refreshAll() {
		await Promise.all([
			this.loadUsers(),
			this.loadAssignedTasks(),
			this.loadTeamActivity(),
			this.loadAdminStats(),
		]);
		// Live notifications
		this.services.subscribeNotifications(this.app.currentUser?.uid, (notifications) => {
			this.notifications = notifications;
			this.renderNotifications();
		});
	}

	// Panel toggle
	toggleAdminPanel() {
		this.app.switchTab('admin');
	}

	// Users
	async loadUsers() {
		this.users = await this.services.loadUsers();
		this.renderUsers();
	}

	renderUsers() {
		const list = document.getElementById('users-list');
		if (!list) return;
		if (this.users.length === 0) {
			list.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No users found</p>';
			return;
		}
		list.innerHTML = this.users.map(user => `
			<div class="user-item">
				<div class="user-info">
					<div class="user-name">${user.name || 'Unnamed'}</div>
					<div class="user-email">${user.email || ''}</div>
					${user.department ? `<div class="user-department">${user.department}</div>` : ''}
				</div>
				<div class="user-actions">
					<span class="user-role ${user.role || 'user'}">${user.role || 'user'}</span>
					<button class="user-action-btn" onclick="adminPanel.deleteUser('${user.id}')" title="Delete">
						<i class="fas fa-trash"></i>
					</button>
				</div>
			</div>
		`).join('');
	}

	openUserModal() {
		const modal = document.getElementById('user-modal');
		document.getElementById('user-form').reset();
		modal.classList.add('active');
	}

	closeUserModal() { document.getElementById('user-modal').classList.remove('active'); }

	async handleUserSubmit(e) {
		e.preventDefault();
		const form = e.target;
		const formData = new FormData(form);
		const userData = {
			email: formData.get('user-email'),
			name: formData.get('user-name'),
			role: formData.get('user-role') || 'user',
			department: formData.get('user-department') || ''
		};
		await this.services.addUserProfile(userData);
		this.closeUserModal();
		await this.loadUsers();
		this.app.showNotification('User profile saved. Ask user to sign up to link their account.', 'success');
	}

	async deleteUser(userId) {
		await this.services.deleteUser(userId);
		await this.loadUsers();
		this.app.showNotification('User deleted successfully!', 'success');
	}

	// Assign tasks
	openAssignTaskModal() {
		const modal = document.getElementById('assign-task-modal');
		const userSelect = document.getElementById('assign-task-user');
		userSelect.innerHTML = '<option value="">Select User</option>';
		this.users.forEach(user => {
			const option = document.createElement('option');
			const hasUid = !!user.uid;
			option.value = hasUid ? `uid:${user.uid}` : `profile:${user.id}`;
			option.textContent = `${user.name || user.email || 'Unnamed'}${hasUid ? '' : ' (no account)'}${user.email ? ` (${user.email})` : ''}`;
			userSelect.appendChild(option);
		});
		document.getElementById('assign-task-form').reset();
		document.getElementById('assign-task-due-date').value = new Date().toISOString().split('T')[0];
		modal.classList.add('active');
	}

	closeAssignTaskModal() { document.getElementById('assign-task-modal').classList.remove('active'); }

	async handleAssignTaskSubmit(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		const selected = formData.get('assign-task-user');
		if (!selected) return;
		const [kind, id] = selected.split(':');
		const assignedTo = kind === 'uid' ? id : null;
		const assignedProfileId = kind === 'profile' ? id : null;
		const taskData = {
			title: formData.get('assign-task-title'),
			description: formData.get('assign-task-description') || '',
			assignedTo,
			assignedProfileId,
			assignedBy: this.app.currentUser.uid,
			priority: formData.get('assign-task-priority'),
			dueDate: formData.get('assign-task-due-date') || '',
			category: formData.get('assign-task-category'),
			status: 'assigned',
			createdAt: new Date().toISOString(),
			completed: false
		};
		await this.services.assignTask(taskData);
		this.closeAssignTaskModal();
		await this.loadAssignedTasks();
		this.app.showNotification('Task assigned successfully!', 'success');
	}

	async loadAssignedTasks() {
		this.assignedTasks = await this.services.loadAssignedTasks();
		this.renderAssignedTasks();
	}

	renderAssignedTasks() {
		const list = document.getElementById('assigned-tasks-list');
		if (!list) return;
		if (this.assignedTasks.length === 0) {
			list.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No assigned tasks</p>';
			return;
		}
		list.innerHTML = this.assignedTasks.map(task => {
			const assignedUser = task.assignedTo 
				? this.users.find(u => u.uid === task.assignedTo)
				: this.users.find(u => u.id === task.assignedProfileId);
			return `
				<div class="assigned-task-item">
					<div class="assigned-task-header">
						<div class="assigned-task-title">${task.title}</div>
						<span class="todo-priority ${task.priority}">${task.priority}</span>
					</div>
					<div class="assigned-task-meta">
						<span>Assigned to: ${assignedUser ? (assignedUser.name || assignedUser.email || 'Unnamed') : 'Unknown'}</span>
						${task.dueDate ? `<span>Due: ${this.app.formatDate(task.dueDate)}</span>` : ''}
						<span>Status: ${task.completed ? 'Completed' : 'Pending'}</span>
					</div>
					${task.description ? `<div class="assigned-task-description">${task.description}</div>` : ''}
				</div>
			`;
		}).join('');
	}

	async loadTeamActivity() {
		this.teamActivity = await this.services.loadTeamActivity();
		this.renderTeamActivity();
	}

	renderTeamActivity() {
		const container = document.getElementById('team-activity');
		if (!container) return;
		if (this.teamActivity.length === 0) {
			container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No recent activity</p>';
			return;
		}
		container.innerHTML = this.teamActivity.map(activity => `
			<div class="activity-item">
				<div class="activity-icon ${activity.type}">
					<i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
				</div>
				<div class="activity-content">
					<div class="activity-text">${activity.message}</div>
					<div class="activity-time">${this.app.formatDate(activity.createdAt)}</div>
				</div>
			</div>
		`).join('');
	}

	getActivityIcon(type) {
		switch (type) {
			case 'task_completed': return 'check';
			case 'task_assigned': return 'tasks';
			case 'user_joined': return 'user-plus';
			default: return 'info';
		}
	}

	async loadAdminStats() {
		const stats = await this.services.loadAdminStats();
		document.getElementById('total-users').textContent = stats.totalUsers;
		document.getElementById('active-tasks').textContent = stats.activeTasks;
		document.getElementById('completed-tasks').textContent = stats.completedTasks;
		document.getElementById('pending-tasks').textContent = stats.pendingTasks;
	}

	renderNotifications() {
		const list = document.getElementById('notifications-list');
		const count = document.getElementById('notification-count');
		if (!list || !count) return;
		const unreadCount = this.notifications.filter(n => !n.read).length;
		count.textContent = unreadCount;
		if (unreadCount > 0) {
			document.getElementById('notifications-dropdown').style.display = 'block';
		}
		if (this.notifications.length === 0) {
			list.innerHTML = '<div class="notification-item"><div class="notification-message">No notifications</div></div>';
			return;
		}
		list.innerHTML = this.notifications.map(notification => `
			<div class="notification-item ${notification.read ? '' : 'unread'}">
				<div class="notification-title">${notification.title}</div>
				<div class="notification-message">${notification.message}</div>
				<div class="notification-time">${this.app.formatDate(notification.createdAt)}</div>
			</div>
		`).join('');
	}

	toggleNotifications() {
		document.getElementById('notifications-list')?.classList.toggle('active');
	}
}

window.AdminPanel = AdminPanel;