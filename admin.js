// Admin Panel Functionality

class AdminPanel {
    constructor(app) {
        this.app = app;
        this.users = [];
        this.assignedTasks = [];
        this.teamActivity = [];
        this.notifications = [];
        this.currentUser = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAdminData();
    }

    setupEventListeners() {
        // Admin panel events
        document.getElementById('admin-toggle')?.addEventListener('click', () => this.toggleAdminPanel());
        document.getElementById('add-user-btn')?.addEventListener('click', () => this.openUserModal());
        document.getElementById('assign-task-btn')?.addEventListener('click', () => this.openAssignTaskModal());
        
        // User management events
        document.getElementById('close-user-modal')?.addEventListener('click', () => this.closeUserModal());
        document.getElementById('cancel-user')?.addEventListener('click', () => this.closeUserModal());
        document.getElementById('user-form')?.addEventListener('submit', (e) => this.handleUserSubmit(e));
        
        // Task assignment events
        document.getElementById('close-assign-task-modal')?.addEventListener('click', () => this.closeAssignTaskModal());
        document.getElementById('cancel-assign-task')?.addEventListener('click', () => this.closeAssignTaskModal());
        document.getElementById('assign-task-form')?.addEventListener('submit', (e) => this.handleAssignTaskSubmit(e));
        
        // Notification events
        document.getElementById('notifications-btn')?.addEventListener('click', () => this.toggleNotifications());
        
        // Modal backdrop clicks
        document.getElementById('user-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'user-modal') this.closeUserModal();
        });
        document.getElementById('assign-task-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'assign-task-modal') this.closeAssignTaskModal();
        });
    }

    // Admin Panel Toggle
    toggleAdminPanel() {
        const adminTab = document.getElementById('admin-tab');
        if (adminTab) {
            this.app.switchTab('admin');
        }
    }

    // User Management
    openUserModal() {
        const modal = document.getElementById('user-modal');
        const form = document.getElementById('user-form');
        const title = document.getElementById('user-modal-title');
        
        title.textContent = 'Add User';
        form.reset();
        modal.classList.add('active');
    }

    closeUserModal() {
        document.getElementById('user-modal').classList.remove('active');
    }

    async handleUserSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            email: formData.get('user-email'),
            name: formData.get('user-name'),
            role: formData.get('user-role'),
            department: formData.get('user-department') || '',
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        try {
            // Create user in Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(
                userData.email, 
                this.generatePassword()
            );
            
            // Save user data to Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                ...userData,
                uid: userCredential.user.uid
            });

            // Send password reset email
            await auth.sendPasswordResetEmail(userData.email);

            this.app.showNotification(`User ${userData.name} created successfully! Password reset email sent.`, 'success');
            this.closeUserModal();
            this.loadUsers();
            
        } catch (error) {
            this.app.showNotification(error.message, 'error');
        }
    }

    generatePassword() {
        return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    }

    // Task Assignment
    openAssignTaskModal() {
        const modal = document.getElementById('assign-task-modal');
        const form = document.getElementById('assign-task-form');
        const userSelect = document.getElementById('assign-task-user');
        
        // Populate user select
        userSelect.innerHTML = '<option value="">Select User</option>';
        this.users.forEach(user => {
            if (user.role === 'user') {
                const option = document.createElement('option');
                option.value = user.uid;
                option.textContent = `${user.name} (${user.email})`;
                userSelect.appendChild(option);
            }
        });
        
        form.reset();
        document.getElementById('assign-task-due-date').value = new Date().toISOString().split('T')[0];
        modal.classList.add('active');
    }

    closeAssignTaskModal() {
        document.getElementById('assign-task-modal').classList.remove('active');
    }

    async handleAssignTaskSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const taskData = {
            title: formData.get('assign-task-title'),
            description: formData.get('assign-task-description') || '',
            assignedTo: formData.get('assign-task-user'),
            assignedBy: this.app.currentUser.uid,
            priority: formData.get('assign-task-priority'),
            dueDate: formData.get('assign-task-due-date') || '',
            category: formData.get('assign-task-category'),
            status: 'assigned',
            createdAt: new Date().toISOString(),
            completed: false
        };

        try {
            // Save assigned task
            const docRef = await db.collection('assignedTasks').add(taskData);
            taskData.id = docRef.id;
            
            // Add to user's todos
            await db.collection('users').doc(taskData.assignedTo)
                .collection('todos').doc(docRef.id).set(taskData);

            // Create notification for assigned user
            await this.createNotification({
                userId: taskData.assignedTo,
                title: 'New Task Assigned',
                message: `You have been assigned: ${taskData.title}`,
                type: 'task_assigned',
                taskId: docRef.id,
                createdAt: new Date().toISOString()
            });

            this.app.showNotification(`Task assigned successfully!`, 'success');
            this.closeAssignTaskModal();
            this.loadAssignedTasks();
            
        } catch (error) {
            this.app.showNotification(error.message, 'error');
        }
    }

    // Notifications
    async createNotification(notificationData) {
        try {
            await db.collection('notifications').add(notificationData);
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    }

    toggleNotifications() {
        const list = document.getElementById('notifications-list');
        list.classList.toggle('active');
    }

    async loadNotifications() {
        if (!this.app.currentUser) return;
        
        try {
            const snapshot = await db.collection('notifications')
                .where('userId', '==', this.app.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            this.notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.renderNotifications();
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    renderNotifications() {
        const list = document.getElementById('notifications-list');
        const count = document.getElementById('notification-count');
        
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
            <div class="notification-item ${notification.read ? '' : 'unread'}" onclick="adminPanel.markNotificationRead('${notification.id}')">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${this.app.formatDate(notification.createdAt)}</div>
            </div>
        `).join('');
    }

    async markNotificationRead(notificationId) {
        try {
            await db.collection('notifications').doc(notificationId).update({
                read: true,
                readAt: new Date().toISOString()
            });
            
            this.loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    // Data Loading
    async loadAdminData() {
        await Promise.all([
            this.loadUsers(),
            this.loadAssignedTasks(),
            this.loadTeamActivity(),
            this.loadAdminStats()
        ]);
    }

    async loadUsers() {
        try {
            const snapshot = await db.collection('users').get();
            this.users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.renderUsers();
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    renderUsers() {
        const list = document.getElementById('users-list');
        
        if (this.users.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No users found</p>';
            return;
        }
        
        list.innerHTML = this.users.map(user => `
            <div class="user-item">
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-email">${user.email}</div>
                    ${user.department ? `<div class="user-department">${user.department}</div>` : ''}
                </div>
                <div class="user-actions">
                    <span class="user-role ${user.role}">${user.role}</span>
                    <button class="user-action-btn" onclick="adminPanel.editUser('${user.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="user-action-btn" onclick="adminPanel.deleteUser('${user.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadAssignedTasks() {
        try {
            const snapshot = await db.collection('assignedTasks')
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();
            
            this.assignedTasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.renderAssignedTasks();
        } catch (error) {
            console.error('Error loading assigned tasks:', error);
        }
    }

    renderAssignedTasks() {
        const list = document.getElementById('assigned-tasks-list');
        
        if (this.assignedTasks.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No assigned tasks</p>';
            return;
        }
        
        list.innerHTML = this.assignedTasks.map(task => {
            const assignedUser = this.users.find(u => u.uid === task.assignedTo);
            return `
                <div class="assigned-task-item">
                    <div class="assigned-task-header">
                        <div class="assigned-task-title">${task.title}</div>
                        <span class="todo-priority ${task.priority}">${task.priority}</span>
                    </div>
                    <div class="assigned-task-meta">
                        <span>Assigned to: ${assignedUser ? assignedUser.name : 'Unknown'}</span>
                        ${task.dueDate ? `<span>Due: ${this.app.formatDate(task.dueDate)}</span>` : ''}
                        <span>Status: ${task.completed ? 'Completed' : 'Pending'}</span>
                    </div>
                    ${task.description ? `<div class="assigned-task-description">${task.description}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    async loadTeamActivity() {
        try {
            const snapshot = await db.collection('teamActivity')
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();
            
            this.teamActivity = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.renderTeamActivity();
        } catch (error) {
            console.error('Error loading team activity:', error);
        }
    }

    renderTeamActivity() {
        const container = document.getElementById('team-activity');
        
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
        try {
            const [usersSnapshot, tasksSnapshot, completedTasksSnapshot] = await Promise.all([
                db.collection('users').get(),
                db.collection('assignedTasks').where('completed', '==', false).get(),
                db.collection('assignedTasks').where('completed', '==', true).get()
            ]);
            
            document.getElementById('total-users').textContent = usersSnapshot.size;
            document.getElementById('active-tasks').textContent = tasksSnapshot.size;
            document.getElementById('completed-tasks').textContent = completedTasksSnapshot.size;
            document.getElementById('pending-tasks').textContent = tasksSnapshot.size;
            
        } catch (error) {
            console.error('Error loading admin stats:', error);
        }
    }

    // User Actions
    async editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        
        const modal = document.getElementById('user-modal');
        const form = document.getElementById('user-form');
        const title = document.getElementById('user-modal-title');
        
        title.textContent = 'Edit User';
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-role').value = user.role;
        document.getElementById('user-department').value = user.department || '';
        
        modal.classList.add('active');
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) return;
        
        try {
            const user = this.users.find(u => u.id === userId);
            if (user) {
                await db.collection('users').doc(userId).delete();
                this.app.showNotification('User deleted successfully!', 'success');
                this.loadUsers();
            }
        } catch (error) {
            this.app.showNotification(error.message, 'error');
        }
    }

    // Check if current user is admin
    checkAdminStatus() {
        if (!this.app.currentUser) return false;
        
        const user = this.users.find(u => u.uid === this.app.currentUser.uid);
        return user && user.role === 'admin';
    }

    // Show/hide admin elements
    updateAdminUI() {
        const isAdmin = this.checkAdminStatus();
        
        // Show/hide admin tab
        const adminTab = document.getElementById('admin-tab');
        if (adminTab) {
            adminTab.style.display = isAdmin ? 'block' : 'none';
        }
        
        // Show/hide admin toggle
        const adminToggle = document.getElementById('admin-toggle');
        if (adminToggle) {
            adminToggle.style.display = isAdmin ? 'block' : 'none';
        }
        
        // Show/hide assigned tasks filter
        const assignedFilter = document.querySelector('[data-filter="assigned"]');
        if (assignedFilter) {
            assignedFilter.style.display = 'block';
        }
        
        // Show/hide assigned tasks button
        const assignedTasksBtn = document.getElementById('assigned-tasks-btn');
        if (assignedTasksBtn) {
            assignedTasksBtn.style.display = 'block';
        }
    }
}

// Initialize admin panel when app is ready
window.AdminPanel = AdminPanel;