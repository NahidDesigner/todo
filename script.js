// Smart Todo App - Main JavaScript File with Firebase Integration

class SmartTodoApp {
    constructor() {
        this.todos = [];
        this.learningItems = [];
        this.currentFilter = 'all';
        this.currentWeek = new Date();
        this.editingTodoId = null;
        this.editingLearningId = null;
        this.currentUser = null;
        this.isOnline = navigator.onLine;
        
        // Modules
        this.notificationsManager = null;
        this.todosModule = null;
        this.learningModule = null;
        this.progressModule = null;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadTheme();
        this.setupFirebaseAuth();
        this.setupOnlineStatus();
        this.setupSampleData();
        
        // Initialize modules
        if (window.NotificationsManager) this.notificationsManager = new window.NotificationsManager(this);
        if (window.TodosModule) this.todosModule = new window.TodosModule(this);
        if (window.LearningModule) this.learningModule = new window.LearningModule(this);
        if (window.ProgressModule) this.progressModule = new window.ProgressModule(this);
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.currentTarget.dataset.tab));
        });

        // Auth events
        document.getElementById('auth-btn').addEventListener('click', () => this.openAuthModal());
        document.getElementById('close-auth-modal').addEventListener('click', () => this.closeAuthModal());
        document.getElementById('switch-to-signup').addEventListener('click', () => this.switchAuthForm('signup'));
        document.getElementById('switch-to-signin').addEventListener('click', () => this.switchAuthForm('signin'));
        document.getElementById('signin-btn').addEventListener('click', () => this.signIn());
        document.getElementById('signup-btn').addEventListener('click', () => this.signUp());

        // Todo events
        document.getElementById('add-todo-btn').addEventListener('click', () => this.openTodoModal());
        document.getElementById('todo-form').addEventListener('submit', (e) => this.handleTodoSubmit(e));
        document.getElementById('close-todo-modal').addEventListener('click', () => this.closeTodoModal());
        document.getElementById('cancel-todo').addEventListener('click', () => this.closeTodoModal());

        // Learning events
        document.getElementById('add-learning-btn').addEventListener('click', () => this.openLearningModal());
        document.getElementById('learning-form').addEventListener('submit', (e) => this.handleLearningSubmit(e));
        document.getElementById('close-learning-modal').addEventListener('click', () => this.closeLearningModal());
        document.getElementById('cancel-learning').addEventListener('click', () => this.closeLearningModal());

        // Filter events
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterTodos(e.target.dataset.filter));
        });

        // Progress navigation
        document.getElementById('prev-week').addEventListener('click', () => this.navigateWeek(-1));
        document.getElementById('next-week').addEventListener('click', () => this.navigateWeek(1));

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Export functionality
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());

        // Modal backdrop clicks
        document.getElementById('todo-modal').addEventListener('click', (e) => {
            if (e.target.id === 'todo-modal') this.closeTodoModal();
        });
        document.getElementById('learning-modal').addEventListener('click', (e) => {
            if (e.target.id === 'learning-modal') this.closeLearningModal();
        });
        document.getElementById('auth-modal').addEventListener('click', (e) => {
            if (e.target.id === 'auth-modal') this.closeAuthModal();
        });

        // Online/offline status
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
    }

    // Firebase Authentication
    setupFirebaseAuth() {
        auth.onAuthStateChanged(async (user) => {
            this.currentUser = user;
            this.updateAuthUI();
            
            if (user) {
                console.log('User signed in:', user.email);
                await this.loadUserData();
                this.setupRealtimeListeners();
                await this.checkAndSetupAdmin(); // Add this line

                // Notifications subscription via NotificationsManager
                this.notificationsManager?.subscribe();
                // Show notifications UI for all signed-in users
                const notificationsDropdown = document.getElementById('notifications-dropdown');
                if (notificationsDropdown) notificationsDropdown.style.display = 'block';
            } else {
                console.log('User signed out');
                this.todos = [];
                this.learningItems = [];
                this.renderTodos();
                this.renderLearningItems();
                this.updateStats();
            }
        });
    }

    // Check and setup admin features
    async checkAndSetupAdmin() {
        try {
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                console.log('User data:', userData);
                
                if (userData.role === 'admin') {
                    console.log('User is admin, showing admin panel');
                    this.showAdminPanel();
                } else {
                    console.log('User is not admin, role:', userData.role);
                }
            } else {
                console.log('User document not found, creating one');
                
                // Check if this is the prepacked admin user
                const isPrepackedAdmin = this.currentUser.email === 'nahidwebdesigner@gmail.com';
                
                // Create user document if it doesn't exist
                await db.collection('users').doc(this.currentUser.uid).set({
                    email: this.currentUser.email,
                    name: isPrepackedAdmin ? 'Nahid' : (this.currentUser.displayName || this.currentUser.email),
                    role: isPrepackedAdmin ? 'admin' : 'user', // Admin for prepacked user
                    createdAt: new Date().toISOString(),
                    uid: this.currentUser.uid
                });
                
                // Show admin panel if prepacked admin
                if (isPrepackedAdmin) {
                    console.log('Prepacked admin user created, showing admin panel');
                    this.showAdminPanel();
                }
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    }

    // Show admin panel
    showAdminPanel() {
        const adminTab = document.getElementById('admin-tab-btn');
        const adminToggle = document.getElementById('admin-toggle');
        const notificationsDropdown = document.getElementById('notifications-dropdown');
        const assignedFilter = document.querySelector('[data-filter="assigned"]');
        const assignedTasksBtn = document.getElementById('assigned-tasks-btn');
        
        if (adminTab) {
            adminTab.style.display = 'block';
            console.log('Admin tab shown');
        }
        if (adminToggle) {
            adminToggle.style.display = 'block';
            console.log('Admin toggle shown');
        }
        if (notificationsDropdown) {
            notificationsDropdown.style.display = 'block';
        }
        if (assignedFilter) {
            assignedFilter.style.display = 'block';
        }
        if (assignedTasksBtn) {
            assignedTasksBtn.style.display = 'block';
        }

        // Initialize AdminPanel once and expose globally
        if (!window.adminPanel && window.AdminPanel) {
            window.adminPanel = new window.AdminPanel(this);
            // Initial load for notifications after admin panel constructed
            window.adminPanel.loadNotifications?.();
            window.adminPanel.updateAdminUI?.();
        }
        // Keep notifications live
        window.adminPanel?.subscribeNotifications?.();
    }

    updateAuthUI() {
        const authBtn = document.getElementById('auth-btn');
        const userEmail = document.getElementById('user-email');
        
        if (this.currentUser) {
            authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sign Out';
            authBtn.className = 'auth-btn';
            authBtn.onclick = () => this.signOut();
            userEmail.textContent = this.currentUser.email;
            userEmail.style.display = 'block';
        } else {
            authBtn.innerHTML = '<i class="fas fa-user"></i> Sign In';
            authBtn.className = 'auth-btn signed-out';
            authBtn.onclick = () => this.openAuthModal();
            userEmail.style.display = 'none';
        }
    }

    openAuthModal() {
        document.getElementById('auth-modal').classList.add('active');
        this.switchAuthForm('signin');
    }

    closeAuthModal() {
        document.getElementById('auth-modal').classList.remove('active');
        // Clear form fields
        document.getElementById('signin-email').value = '';
        document.getElementById('signin-password').value = '';
        document.getElementById('signup-email').value = '';
        document.getElementById('signup-password').value = '';
        document.getElementById('signup-confirm-password').value = '';
    }

    switchAuthForm(formType) {
        const signinForm = document.getElementById('signin-form');
        const signupForm = document.getElementById('signup-form');
        const modalTitle = document.getElementById('auth-modal-title');
        
        if (formType === 'signup') {
            signinForm.style.display = 'none';
            signupForm.style.display = 'block';
            modalTitle.textContent = 'Create Account';
        } else {
            signinForm.style.display = 'block';
            signupForm.style.display = 'none';
            modalTitle.textContent = 'Sign In';
        }
    }

    async signIn() {
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
            this.closeAuthModal();
            this.showNotification('Signed in successfully!', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async signUp() {
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match!', 'error');
            return;
        }
        
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Check if this is the prepacked admin user
            const isPrepackedAdmin = email === 'nahidwebdesigner@gmail.com';
            
            if (isPrepackedAdmin) {
                this.showNotification('Admin account created successfully! Welcome Nahid!', 'success');
            } else {
                this.showNotification('Account created successfully!', 'success');
            }
            
            this.closeAuthModal();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async signOut() {
        try {
            await auth.signOut();
            this.showNotification('Signed out successfully!', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // Firebase Data Management
    async loadUserData() {
        if (!this.currentUser) return;
        
        try {
            // Load todos
            const todosSnapshot = await db.collection('users').doc(this.currentUser.uid)
                .collection('todos').get();
            
            this.todos = todosSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Load learning items
            const learningSnapshot = await db.collection('users').doc(this.currentUser.uid)
                .collection('learning').get();
            
            this.learningItems = learningSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.renderTodos();
            this.renderLearningItems();
            this.updateStats();
            this.renderProgress();
            
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showNotification('Error loading data. Using local storage as backup.', 'warning');
            this.loadLocalData();
        }
    }

    setupRealtimeListeners() {
        if (!this.currentUser) return;
        
        // Real-time todos listener (assign full array to avoid duplicates)
        db.collection('users').doc(this.currentUser.uid)
            .collection('todos')
            .onSnapshot((snapshot) => {
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Deduplicate by id (should be unique, just in case)
                const map = new Map();
                list.forEach(t => map.set(t.id, t));
                this.todos = Array.from(map.values());
                this.renderTodos();
                this.updateStats();
            });
        
        // Real-time learning listener (assign full array)
        db.collection('users').doc(this.currentUser.uid)
            .collection('learning')
            .onSnapshot((snapshot) => {
                this.learningItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                this.renderLearningItems();
                this.updateStats();
            });
    }

    async saveTodo(todo) {
        if (!this.currentUser) {
            this.saveLocalTodos();
            return;
        }
        
        try {
            if (todo.id) {
                // Update existing todo
                await db.collection('users').doc(this.currentUser.uid)
                    .collection('todos').doc(todo.id).set(todo);
            } else {
                // Add new todo
                const docRef = await db.collection('users').doc(this.currentUser.uid)
                    .collection('todos').add(todo);
                todo.id = docRef.id;
            }
        } catch (error) {
            console.error('Error saving todo:', error);
            this.showNotification('Error saving to cloud. Using local storage.', 'warning');
            this.saveLocalTodos();
        }
    }

    async saveLearningItem(learning) {
        if (!this.currentUser) {
            this.saveLocalLearningItems();
            return;
        }
        
        try {
            if (learning.id) {
                // Update existing learning item
                await db.collection('users').doc(this.currentUser.uid)
                    .collection('learning').doc(learning.id).set(learning);
            } else {
                // Add new learning item
                const docRef = await db.collection('users').doc(this.currentUser.uid)
                    .collection('learning').add(learning);
                learning.id = docRef.id;
            }
        } catch (error) {
            console.error('Error saving learning item:', error);
            this.showNotification('Error saving to cloud. Using local storage.', 'warning');
            this.saveLocalLearningItems();
        }
    }

    async deleteTodo(todoId) {
        if (!this.currentUser) {
            this.todos = this.todos.filter(t => t.id !== todoId);
            this.saveLocalTodos();
            this.renderTodos();
            this.updateStats();
            return;
        }
        
        // Prevent deleting assigned tasks by users
        const target = this.todos.find(t => t.id === todoId);
        if (target && (target.assignedBy || target.assignedTo)) {
            this.showNotification('Assigned tasks can only be deleted by admin.', 'warning');
            return;
        }
        
        // Optimistic UI update
        const previousTodos = [...this.todos];
        this.todos = this.todos.filter(t => t.id !== todoId);
        this.renderTodos();
        this.updateStats();
        
        try {
            await db.collection('users').doc(this.currentUser.uid)
                .collection('todos').doc(todoId).delete();
        } catch (error) {
            console.error('Error deleting todo:', error);
            this.showNotification('Error deleting from cloud. Reverting change.', 'warning');
            // Revert UI on failure
            this.todos = previousTodos;
            this.renderTodos();
            this.updateStats();
        }
    }

    // Local Storage Backup
    loadLocalData() {
        this.todos = JSON.parse(localStorage.getItem('smartTodo_todos')) || [];
        this.learningItems = JSON.parse(localStorage.getItem('smartTodo_learning')) || [];
    }

    saveLocalTodos() {
        localStorage.setItem('smartTodo_todos', JSON.stringify(this.todos));
    }

    saveLocalLearningItems() {
        localStorage.setItem('smartTodo_learning', JSON.stringify(this.learningItems));
    }

    // Online Status Management
    setupOnlineStatus() {
        this.updateOnlineStatus();
    }

    handleOnlineStatus(isOnline) {
        this.isOnline = isOnline;
        this.updateOnlineStatus();
        
        if (isOnline && this.currentUser) {
            this.showNotification('Back online! Syncing data...', 'success');
            this.loadUserData();
        } else if (!isOnline) {
            this.showNotification('You are offline. Changes will be saved locally.', 'warning');
        }
    }

    updateOnlineStatus() {
        const statusIndicator = document.createElement('div');
        statusIndicator.className = `online-status ${this.isOnline ? 'online' : 'offline'}`;
        statusIndicator.innerHTML = `<i class="fas fa-${this.isOnline ? 'wifi' : 'wifi-slash'}"></i>`;
        statusIndicator.title = this.isOnline ? 'Online' : 'Offline';
        
        // Remove existing indicator
        const existing = document.querySelector('.online-status');
        if (existing) existing.remove();
        
        // Add new indicator
        document.querySelector('.header-actions').prepend(statusIndicator);
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    // Tab Management
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Update specific content based on tab
        if (tabName === 'progress') {
            this.renderProgress();
        }
    }

    // Todo Management
    openTodoModal(todoId = null) {
        const modal = document.getElementById('todo-modal');
        const form = document.getElementById('todo-form');
        const title = document.getElementById('todo-modal-title');

        if (todoId) {
            // Edit mode
            const todo = this.todos.find(t => t.id === todoId);
            if (todo) {
                this.editingTodoId = todoId;
                title.textContent = 'Edit Task';
                document.getElementById('todo-title').value = todo.title;
                document.getElementById('todo-description').value = todo.description || '';
                document.getElementById('todo-priority').value = todo.priority;
                document.getElementById('todo-due-date').value = todo.dueDate || '';
            }
        } else {
            // Add mode
            this.editingTodoId = null;
            title.textContent = 'Add New Task';
            form.reset();
            document.getElementById('todo-due-date').value = new Date().toISOString().split('T')[0];
        }

        modal.classList.add('active');
    }

    closeTodoModal() {
        document.getElementById('todo-modal').classList.remove('active');
        this.editingTodoId = null;
    }

    async handleTodoSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const todoData = {
            title: formData.get('todo-title') || document.getElementById('todo-title').value,
            description: formData.get('todo-description') || document.getElementById('todo-description').value,
            priority: formData.get('todo-priority') || document.getElementById('todo-priority').value,
            dueDate: formData.get('todo-due-date') || document.getElementById('todo-due-date').value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        if (this.editingTodoId) {
            // Update existing todo
            const index = this.todos.findIndex(t => t.id === this.editingTodoId);
            if (index !== -1) {
                this.todos[index] = { ...this.todos[index], ...todoData };
                await this.saveTodo(this.todos[index]);
            }
        } else {
            // Add new todo
            todoData.id = this.generateId();
            this.todos.push(todoData);
            await this.saveTodo(todoData);
        }

        this.renderTodos();
        this.closeTodoModal();
        this.updateStats();
    }

    renderTodos() {
        const todoList = document.getElementById('todo-list');
        const filteredTodos = this.getFilteredTodos();
        
        if (this.todosModule) {
            this.todosModule.render(filteredTodos, this.currentFilter);
            return;
        }

        if (filteredTodos.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary); text-align: center;">
                        ${this.currentFilter === 'all' ? 'No tasks yet. Add your first task!' : `No ${this.currentFilter} tasks.`}
                    </p>
                </div>
            `;
            return;
        }

        todoList.innerHTML = filteredTodos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''} fade-in" data-id="${todo.id}">
                <div class="todo-header">
                    <div class="checkbox-wrapper" onclick="app.toggleTodo('${todo.id}')">
                        <div class="checkbox ${todo.completed ? 'checked' : ''}"></div>
                        <div class="todo-title">${this.escapeHtml(todo.title)}</div>
                    </div>
                    <div class="todo-actions">
                        <button class="todo-action-btn" onclick="app.openTodoModal('${todo.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="todo-action-btn" onclick="app.deleteTodo('${todo.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${todo.description ? `<div class="todo-description">${this.escapeHtml(todo.description)}</div>` : ''}
                <div class="todo-meta">
                    <span class="todo-priority ${todo.priority}">${todo.priority}</span>
                    ${todo.dueDate ? `<span>Due: ${this.formatDate(todo.dueDate)}</span>` : ''}
                    <span>Created: ${this.formatDate(todo.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }

    getFilteredTodos() {
        let filtered = this.todos;
        
        switch (this.currentFilter) {
            case 'pending':
                filtered = this.todos.filter(todo => !todo.completed);
                break;
            case 'completed':
                filtered = this.todos.filter(todo => todo.completed);
                break;
            case 'priority':
                filtered = this.todos.filter(todo => todo.priority === 'high' && !todo.completed);
                break;
            case 'assigned':
                filtered = this.todos.filter(todo => !todo.completed && (!!todo.assignedTo && this.currentUser && todo.assignedTo === this.currentUser.uid));
                break;
        }
        
        return filtered.sort((a, b) => {
            // Sort by due date ascending (empty due dates last), then by creation date desc
            const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
            const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
            if (aDue !== bDue) return aDue - bDue;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    filterTodos(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTodos();
    }

    async toggleTodo(todoId) {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            todo.completed = !todo.completed;
            if (todo.completed) {
                todo.completedAt = new Date().toISOString();
            } else {
                delete todo.completedAt;
            }
            await this.saveTodo(todo);
            this.renderTodos();
            this.updateStats();

            // Sync assignedTasks collection if this is an assigned task
            if (todo.id && (todo.assignedBy || todo.assignedTo)) {
                try {
                    await db.collection('assignedTasks').doc(todo.id).set({
                        completed: !!todo.completed,
                        completedAt: todo.completed ? todo.completedAt : null
                    }, { merge: true });
                } catch (err) {
                    console.error('Error syncing assignedTasks on toggle:', err);
                }
            }

            // If this was an assigned task, notify admin and log activity on completion
            if (todo.assignedBy && todo.assignedTo && todo.completed) {
                try {
                    // Notify the assigning admin
                    await db.collection('notifications').add({
                        userId: todo.assignedBy,
                        title: 'Task Completed',
                        message: `Assigned task completed: ${todo.title}`,
                        type: 'task_completed',
                        taskId: todo.id,
                        createdAt: new Date().toISOString(),
                        read: false
                    });
                    // Log team activity
                    await db.collection('teamActivity').add({
                        type: 'task_completed',
                        message: `${this.currentUser?.email || 'User'} completed "${todo.title}"`,
                        taskId: todo.id,
                        userId: this.currentUser?.uid,
                        createdAt: new Date().toISOString()
                    });
                } catch (error) {
                    console.error('Error creating completion notifications/activity:', error);
                }
            }
        }
    }

    // Learning Management
    openLearningModal(learningId = null) {
        const modal = document.getElementById('learning-modal');
        const form = document.getElementById('learning-form');
        const title = document.getElementById('learning-modal-title');

        if (learningId) {
            // Edit mode
            const learning = this.learningItems.find(l => l.id === learningId);
            if (learning) {
                this.editingLearningId = learningId;
                title.textContent = 'Edit Learning Item';
                document.getElementById('learning-title').value = learning.title;
                document.getElementById('learning-category').value = learning.category;
                document.getElementById('learning-notes').value = learning.notes || '';
            }
        } else {
            // Add mode
            this.editingLearningId = null;
            title.textContent = 'Add Learning Item';
            form.reset();
        }

        modal.classList.add('active');
    }

    closeLearningModal() {
        document.getElementById('learning-modal').classList.remove('active');
        this.editingLearningId = null;
    }

    async handleLearningSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const learningData = {
            title: formData.get('learning-title') || document.getElementById('learning-title').value,
            category: formData.get('learning-category') || document.getElementById('learning-category').value,
            notes: formData.get('learning-notes') || document.getElementById('learning-notes').value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        if (this.editingLearningId) {
            // Update existing learning item
            const index = this.learningItems.findIndex(l => l.id === this.editingLearningId);
            if (index !== -1) {
                this.learningItems[index] = { ...this.learningItems[index], ...learningData };
                await this.saveLearningItem(this.learningItems[index]);
            }
        } else {
            // Add new learning item
            learningData.id = this.generateId();
            this.learningItems.push(learningData);
            await this.saveLearningItem(learningData);
        }

        this.renderLearningItems();
        this.closeLearningModal();
        this.updateStats();
    }

    renderLearningItems() {
        const learningList = document.getElementById('learning-list');
        const today = new Date().toDateString();
        
        // Get today's learning items or create new ones from yesterday
        let todayItems = this.learningItems.filter(item => 
            new Date(item.createdAt).toDateString() === today
        );

        // If no items for today, copy yesterday's items
        if (todayItems.length === 0) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayItems = this.learningItems.filter(item => 
                new Date(item.createdAt).toDateString() === yesterday.toDateString()
            );
            
            todayItems = yesterdayItems.map(item => ({
                ...item,
                id: this.generateId(),
                completed: false,
                createdAt: new Date().toISOString(),
                completedAt: null
            }));
            
            this.learningItems.push(...todayItems);
            todayItems.forEach(item => this.saveLearningItem(item));
        }

        if (todayItems.length === 0) {
            learningList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary); text-align: center;">
                        No learning items. Add one to get started!
                    </p>
                </div>
            `;
            return;
        }

        if (this.learningModule) {
            this.learningModule.render(todayItems);
            return;
        }

        learningList.innerHTML = todayItems.map(item => `
            <div class="learning-item ${item.completed ? 'completed' : ''} fade-in" data-id="${item.id}">
                <div class="learning-header">
                    <div class="checkbox-wrapper" onclick="app.toggleLearning('${item.id}')">
                        <div class="checkbox ${item.completed ? 'checked' : ''}"></div>
                        <div class="learning-title">${this.escapeHtml(item.title)}</div>
                    </div>
                    <div class="learning-category">${item.category}</div>
                </div>
                ${item.notes ? `<div class="learning-notes">${this.escapeHtml(item.notes)}</div>` : ''}
                <div class="learning-meta">
                    <span>Category: ${item.category}</span>
                    <span>Created: ${this.formatDate(item.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }

    async toggleLearning(learningId) {
        const learning = this.learningItems.find(l => l.id === learningId);
        if (learning) {
            learning.completed = !learning.completed;
            if (learning.completed) {
                learning.completedAt = new Date().toISOString();
            } else {
                delete learning.completedAt;
            }
            await this.saveLearningItem(learning);
            this.renderLearningItems();
            this.updateStats();
        }
    }

    // Progress Tracking
    navigateWeek(direction) {
        this.currentWeek.setDate(this.currentWeek.getDate() + (direction * 7));
        this.renderProgress();
    }

    renderProgress() {
        const dailyData = [];
        const categoryData = [];
        const summary = { completed: this.todos.filter(t => t.completed).length, pending: this.todos.filter(t => !t.completed).length };
        if (this.progressModule) {
            this.progressModule.render(dailyData, categoryData, summary);
            return;
        }

        this.updateWeekDisplay();
        this.renderDailyChart();
        this.renderCategoryChart();
        this.renderWeeklySummary();
    }

    updateWeekDisplay() {
        const weekStart = this.getWeekStart(this.currentWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const display = document.getElementById('current-week');
        if (this.isCurrentWeek()) {
            display.textContent = 'This Week';
        } else {
            display.textContent = `${this.formatDate(weekStart)} - ${this.formatDate(weekEnd)}`;
        }
    }

    renderDailyChart() {
        const chart = document.getElementById('daily-chart');
        const weekStart = this.getWeekStart(this.currentWeek);
        const dailyData = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateStr = date.toDateString();
            
            const todosCompleted = this.todos.filter(todo => 
                todo.completed && 
                todo.completedAt && 
                new Date(todo.completedAt).toDateString() === dateStr
            ).length;
            
            const learningCompleted = this.learningItems.filter(item => 
                item.completed && 
                item.completedAt && 
                new Date(item.completedAt).toDateString() === dateStr
            ).length;
            
            dailyData.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                total: todosCompleted + learningCompleted,
                todos: todosCompleted,
                learning: learningCompleted
            });
        }

        const maxValue = Math.max(...dailyData.map(d => d.total), 1);
        
        chart.innerHTML = dailyData.map(data => `
            <div class="chart-bar" style="height: ${(data.total / maxValue) * 100}%" title="${data.day}: ${data.total} items">
                <div class="chart-label">${data.day}</div>
            </div>
        `).join('');
    }

    renderCategoryChart() {
        const chart = document.getElementById('category-chart');
        const categories = {};
        
        this.learningItems.forEach(item => {
            if (item.completed && item.completedAt) {
                const weekStart = this.getWeekStart(this.currentWeek);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                const completedDate = new Date(item.completedAt);
                if (completedDate >= weekStart && completedDate <= weekEnd) {
                    categories[item.category] = (categories[item.category] || 0) + 1;
                }
            }
        });

        const categoryData = Object.entries(categories).map(([category, count]) => ({
            category,
            count
        }));

        if (categoryData.length === 0) {
            chart.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No learning completed this week</p>';
            return;
        }

        const maxCount = Math.max(...categoryData.map(d => d.count));
        
        chart.innerHTML = categoryData.map(data => `
            <div class="chart-bar" style="height: ${(data.count / maxCount) * 100}%" title="${data.category}: ${data.count} items">
                <div class="chart-label">${data.category}</div>
            </div>
        `).join('');
    }

    renderWeeklySummary() {
        const summary = document.getElementById('weekly-summary');
        const weekStart = this.getWeekStart(this.currentWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const todosCompleted = this.todos.filter(todo => 
            todo.completed && 
            todo.completedAt && 
            new Date(todo.completedAt) >= weekStart && 
            new Date(todo.completedAt) <= weekEnd
        ).length;
        
        const learningCompleted = this.learningItems.filter(item => 
            item.completed && 
            item.completedAt && 
            new Date(item.completedAt) >= weekStart && 
            new Date(item.completedAt) <= weekEnd
        ).length;
        
        const totalItems = todosCompleted + learningCompleted;
        
        let summaryHTML = `
            <p><strong>Week of ${this.formatDate(weekStart)}</strong></p>
            <p>Total completed: <strong>${totalItems}</strong> items</p>
            <ul style="margin-top: 1rem;">
                <li>Tasks completed: <strong>${todosCompleted}</strong></li>
                <li>Learning items completed: <strong>${learningCompleted}</strong></li>
            </ul>
        `;
        
        if (totalItems > 0) {
            const avgPerDay = (totalItems / 7).toFixed(1);
            summaryHTML += `<p style="margin-top: 1rem;">Average per day: <strong>${avgPerDay}</strong> items</p>`;
        }
        
        summary.innerHTML = summaryHTML;
    }

    // Stats Management
    updateStats() {
        const today = new Date().toDateString();
        
        // Today's completed items
        const todayTodos = this.todos.filter(todo => 
            todo.completed && 
            todo.completedAt && 
            new Date(todo.completedAt).toDateString() === today
        ).length;
        
        const todayLearning = this.learningItems.filter(item => 
            item.completed && 
            item.completedAt && 
            new Date(item.completedAt).toDateString() === today
        ).length;
        
        document.getElementById('today-completed').textContent = todayTodos + todayLearning;
        
        // This week's completed items
        const weekStart = this.getWeekStart(new Date());
        const weekTodos = this.todos.filter(todo => 
            todo.completed && 
            todo.completedAt && 
            new Date(todo.completedAt) >= weekStart
        ).length;
        
        const weekLearning = this.learningItems.filter(item => 
            item.completed && 
            item.completedAt && 
            new Date(item.completedAt) >= weekStart
        ).length;
        
        document.getElementById('week-completed').textContent = weekTodos + weekLearning;
        
        // Streak calculation
        const streak = this.calculateStreak();
        document.getElementById('streak-days').textContent = streak;
    }

    calculateStreak() {
        let streak = 0;
        let currentDate = new Date();
        
        while (true) {
            const dateStr = currentDate.toDateString();
            const hasTodos = this.todos.some(todo => 
                todo.completed && 
                todo.completedAt && 
                new Date(todo.completedAt).toDateString() === dateStr
            );
            const hasLearning = this.learningItems.some(item => 
                item.completed && 
                item.completedAt && 
                new Date(item.completedAt).toDateString() === dateStr
            );
            
            if (hasTodos || hasLearning) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }

    isCurrentWeek() {
        const currentWeekStart = this.getWeekStart(new Date());
        const selectedWeekStart = this.getWeekStart(this.currentWeek);
        return currentWeekStart.getTime() === selectedWeekStart.getTime();
    }

    // Theme Management
    loadTheme() {
        const theme = localStorage.getItem('smartTodo_theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('smartTodo_theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#theme-toggle i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Export Functionality
    exportData() {
        const data = {
            todos: this.todos,
            learningItems: this.learningItems,
            exportDate: new Date().toISOString(),
            user: this.currentUser ? this.currentUser.email : 'anonymous'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smart-todo-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'success');
    }

    // Sample Data Setup
    setupSampleData() {
        if (this.todos.length === 0 && this.learningItems.length === 0 && !this.currentUser) {
            // Add sample todos
            const sampleTodos = [
                {
                    id: this.generateId(),
                    title: 'Complete project proposal',
                    description: 'Finish the quarterly project proposal document',
                    priority: 'high',
                    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    completed: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    title: 'Review code changes',
                    description: 'Review pull requests for the main branch',
                    priority: 'medium',
                    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    completed: false,
                    createdAt: new Date().toISOString()
                }
            ];

            // Add sample learning items
            const sampleLearning = [
                {
                    id: this.generateId(),
                    title: 'Learn React Hooks',
                    category: 'programming',
                    notes: 'Focus on useState, useEffect, and custom hooks. Practice with small projects.',
                    completed: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    title: 'Study UX Design Principles',
                    category: 'design',
                    notes: 'Read about user experience design, accessibility, and user research methods.',
                    completed: false,
                    createdAt: new Date().toISOString()
                }
            ];

            this.todos.push(...sampleTodos);
            this.learningItems.push(...sampleLearning);
            this.saveLocalTodos();
            this.saveLocalLearningItems();
            this.renderTodos();
            this.renderLearningItems();
            this.updateStats();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SmartTodoApp();
});

// Add global functions for onclick handlers
window.app = null;