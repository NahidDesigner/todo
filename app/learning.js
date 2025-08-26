// Learning Module - basic rendering for daily checklist

class LearningModule {
	constructor(app) {
		this.app = app;
		this.listEl = document.getElementById('learning-list');
	}

	render(items) {
		if (!this.listEl) return;
		if (!items || items.length === 0) {
			this.listEl.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">No learning items for today.</p>';
			return;
		}
		this.listEl.innerHTML = items.map(item => `
			<div class="learning-item ${item.completed ? 'completed' : ''}">
				<div class="learning-header">
					<div class="checkbox-wrapper" onclick="app.toggleLearning('${item.id}')">
						<div class="checkbox ${item.completed ? 'checked' : ''}"></div>
						<div class="learning-title">${this.app.escapeHtml(item.title)}</div>
					</div>
					<div class="learning-meta">
						<span class="learning-category">${item.category}</span>
					</div>
				</div>
				${item.notes ? `<div class="learning-notes">${this.app.escapeHtml(item.notes)}</div>` : ''}
			</div>
		`).join('');
	}
}

window.LearningModule = LearningModule;