// Local Testing Script - Enable Admin Features
// Add this to your HTML file for local testing

// Force admin mode for local testing
window.forceAdminMode = true;

// Override admin check for local testing
if (window.app) {
    app.checkAdminStatus = function() {
        return true; // Always return true for local testing
    };
    
    app.setupAdminFeatures = function() {
        // Show all admin elements
        const adminTab = document.getElementById('admin-tab');
        const adminToggle = document.getElementById('admin-toggle');
        const notificationsDropdown = document.getElementById('notifications-dropdown');
        const assignedFilter = document.querySelector('[data-filter="assigned"]');
        const assignedTasksBtn = document.getElementById('assigned-tasks-btn');
        
        if (adminTab) adminTab.style.display = 'block';
        if (adminToggle) adminToggle.style.display = 'block';
        if (notificationsDropdown) notificationsDropdown.style.display = 'block';
        if (assignedFilter) assignedFilter.style.display = 'block';
        if (assignedTasksBtn) assignedTasksBtn.style.display = 'block';
        
        console.log('Admin features enabled for local testing');
    };
}

// Add this to your HTML file:
// <script src="local-test.js"></script>