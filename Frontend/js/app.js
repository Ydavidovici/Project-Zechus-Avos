function setupMainPageEventListeners() {
    const viewAllButton = document.getElementById('view-all-sponsorships');
    viewAllButton.addEventListener('click', () => {
        window.location.href = '/sponsorships.html'; // Navigate to the sponsorships page
    });
    // Add other event listeners as needed for main page interactions
}

// Assuming this is called either at the end of `init.js` or directly in your HTML
setupMainPageEventListeners();
