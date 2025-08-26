// Notifications Manager - decoupled from AdminPanel

class NotificationsManager {
	constructor(app) {
		this.app = app;
		this.unsubscribe = null;
	}

	subscribe() {
		this.unsubscribe?.();
		if (!this.app.currentUser) return;
		this.unsubscribe = db.collection('notifications')
			.where('userId', '==', this.app.currentUser.uid)
			.orderBy('createdAt', 'desc')
			.limit(10)
			.onSnapshot((snapshot) => {
				const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
				this.render(notifications);
			}, (error) => console.error('Notifications subscribe error:', error));
	}

	render(notifications) {
		const list = document.getElementById('notifications-list');
		const count = document.getElementById('notification-count');
		if (!list || !count) return;
		const unread = notifications.filter(n => !n.read).length;
		count.textContent = unread;
		if (unread > 0) {
			document.getElementById('notifications-dropdown').style.display = 'block';
		}
		if (notifications.length === 0) {
			list.innerHTML = '<div class="notification-item"><div class="notification-message">No notifications</div></div>';
			return;
		}
		list.innerHTML = notifications.map(n => `
			<div class="notification-item ${n.read ? '' : 'unread'}">
				<div class="notification-title">${n.title}</div>
				<div class="notification-message">${n.message}</div>
				<div class="notification-time">${this.app.formatDate(n.createdAt)}</div>
			</div>
		`).join('');
	}
}

window.NotificationsManager = NotificationsManager;