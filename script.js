// Smart Todo App - Main JavaScript File

class SmartTodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('smartTodo_todos')) || [];
        this.learningItems = JSON.parse(localStorage.getItem('smartTodo_learning')) || [];
        this.currentFilter = 'all';
        this.currentWeek = new Date();
        this.editingTodoId = null;
        this.editingLearningId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.renderTodos();
        this.renderLearningItems();
        this.updateStats();
        this.renderProgress();
        this.setupSampleData();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

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

    handleTodoSubmit(e) {
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
            }
        } else {
            // Add new todo
            todoData.id = this.generateId();
            this.todos.push(todoData);
        }

        this.saveTodos();
        this.renderTodos();
        this.closeTodoModal();
        this.updateStats();
    }

    renderTodos() {
        const todoList = document.getElementById('todo-list');
        const filteredTodos = this.getFilteredTodos();
        
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
        }
        
        return filtered.sort((a, b) => {
            // Sort by priority first, then by creation date
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority] || 1;
            const bPriority = priorityOrder[b.priority] || 1;
            
            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }
            
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

    toggleTodo(todoId) {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            todo.completed = !todo.completed;
            if (todo.completed) {
                todo.completedAt = new Date().toISOString();
            } else {
                delete todo.completedAt;
            }
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
        }
    }

    deleteTodo(todoId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== todoId);
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
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

    handleLearningSubmit(e) {
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
            }
        } else {
            // Add new learning item
            learningData.id = this.generateId();
            this.learningItems.push(learningData);
        }

        this.saveLearningItems();
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
            this.saveLearningItems();
        }

        if (todayItems.length === 0) {
            learningList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-graduation-cap" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary); text-align: center;">
                        No learning items for today. Add your first learning goal!
                    </p>
                </div>
            `;
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

    toggleLearning(learningId) {
        const learning = this.learningItems.find(l => l.id === learningId);
        if (learning) {
            learning.completed = !learning.completed;
            if (learning.completed) {
                learning.completedAt = new Date().toISOString();
            } else {
                delete learning.completedAt;
            }
            this.saveLearningItems();
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
        const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
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

    // Data Persistence
    saveTodos() {
        localStorage.setItem('smartTodo_todos', JSON.stringify(this.todos));
    }

    saveLearningItems() {
        localStorage.setItem('smartTodo_learning', JSON.stringify(this.learningItems));
    }

    // Export Functionality
    exportData() {
        const data = {
            todos: this.todos,
            learningItems: this.learningItems,
            exportDate: new Date().toISOString()
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
    }

    // Sample Data Setup
    setupSampleData() {
        if (this.todos.length === 0 && this.learningItems.length === 0) {
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
            this.saveTodos();
            this.saveLearningItems();
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