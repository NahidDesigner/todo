// Todos Module - handles list rendering and interactions

class TodosModule {
	constructor(app) {
		this.app = app;
		this.listEl = document.getElementById('todo-list');
		this.bindDelegates();
	}

	bindDelegates() {
		if (!this.listEl) return;
		this.listEl.addEventListener('click', (e) => {
			const actionBtn = e.target.closest('.todo-action-btn');
			const itemEl = e.target.closest('.todo-item');
			if (!itemEl) return;
			const id = itemEl.getAttribute('data-id');
			if (e.target.closest('.checkbox-wrapper')) {
				this.app.toggleTodo(id);
				return;
			}
			if (actionBtn) {
				if (actionBtn.title === 'Edit') this.app.openTodoModal(id);
				if (actionBtn.title === 'Delete') this.app.deleteTodo(id);
			}
		});
	}

	render(todos, currentFilter) {
		if (!this.listEl) return;
		if (todos.length === 0) {
			this.listEl.innerHTML = `
				<div class="empty-state">
					<i class="fas fa-clipboard-list" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
					<p style="color: var(--text-secondary); text-align: center;">
						${currentFilter === 'all' ? 'No tasks yet. Add your first task!' : `No ${currentFilter} tasks.`}
					</p>
				</div>
			`;
			return;
		}
		// Group by dueDate day (fallback to createdAt) label
		const groups = new Map();
		for (const t of todos) {
			const dateStr = (t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt)).toDateString();
			if (!groups.has(dateStr)) groups.set(dateStr, []);
			groups.get(dateStr).push(t);
		}
		// Render grouped
		this.listEl.innerHTML = Array.from(groups.entries()).map(([dateStr, items]) => {
			return `
				<div class="todo-day-group">
					<div class="todo-day-header">${dateStr}</div>
					${items.map(todo => {
						const isAssigned = !!(todo.assignedBy || todo.assignedTo || todo.assignedTaskId);
						return `
							<div class="todo-item ${todo.completed ? 'completed' : ''} fade-in" data-id="${todo.id}">
								<div class="todo-header">
									<div class="checkbox-wrapper">
										<div class="checkbox ${todo.completed ? 'checked' : ''}"></div>
										<div class="todo-title">${this.app.escapeHtml(todo.title)}</div>
									</div>
									<div class="todo-actions">
										<button class="todo-action-btn" title="Edit">
											<i class="fas fa-edit"></i>
										</button>
										${isAssigned ? '' : `
										<button class=\"todo-action-btn\" title=\"Delete\"> 
											<i class=\"fas fa-trash\"></i>
										</button>`}
									</div>
								</div>
								${todo.description ? `<div class="todo-description">${this.app.escapeHtml(todo.description)}</div>` : ''}
								<div class="todo-meta">
									<span class="todo-priority ${todo.priority}">${todo.priority}</span>
									${todo.dueDate ? `<span>Due: ${this.app.formatDate(todo.dueDate)}</span>` : ''}
									<span>Created: ${this.app.formatDate(todo.createdAt)}</span>
								</div>
							</div>`;
						}).join('')}
				</div>
			`;
		}).join('');
	}
}

window.TodosModule = TodosModule;