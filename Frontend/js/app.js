// Example setup function
function setup() {
    // Code to run on every page load
    initializeGlobalComponents();
}

// Initialize global UI components (modals, navbars, etc.)
function initializeGlobalComponents() {
    // Setup logic here
}

// Utility function example
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Run setup on load
document.addEventListener('DOMContentLoaded', setup);
