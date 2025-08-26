// Progress Module - renders weekly summaries placeholders

class ProgressModule {
	constructor(app) {
		this.app = app;
		this.dailyChartEl = document.getElementById('daily-chart');
		this.categoryChartEl = document.getElementById('category-chart');
		this.summaryEl = document.getElementById('weekly-summary');
	}

	render(dailyData, categoryData, summary) {
		if (this.dailyChartEl) this.dailyChartEl.innerHTML = this.renderBars(dailyData);
		if (this.categoryChartEl) this.categoryChartEl.innerHTML = this.renderBars(categoryData);
		if (this.summaryEl) this.summaryEl.innerHTML = this.renderSummary(summary);
	}

	renderBars(data = []) {
		if (!data.length) return '<div style="color: var(--text-secondary);">No data</div>';
		const max = Math.max(...data.map(d => d.value), 1);
		return `
			<div class="bar-chart">
				${data.map(d => `<div class="bar" title="${d.label}: ${d.value}" style="height: ${(d.value / max) * 100}%;"></div>`).join('')}
			</div>
		`;
	}

	renderSummary(summary = {}) {
		return `
			<div>Completed this week: <strong>${summary.completed || 0}</strong></div>
			<div>Pending: <strong>${summary.pending || 0}</strong></div>
		`;
	}
}

window.ProgressModule = ProgressModule;