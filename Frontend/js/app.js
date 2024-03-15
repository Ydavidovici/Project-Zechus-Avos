document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the sponsorships page and only then fetch and display mitzvot
    if (window.location.pathname.endsWith('sponsorships.html')) {
        fetchAndDisplayMitzvot();
    }

    // Setup listeners for the main page if needed
    setupMainPageEventListeners();
});

function fetchAndDisplayMitzvot() {
    fetch('http://localhost:3000/api/mitzvot')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(responseObject => { // Changed variable name for clarity
            renderMitzvot(responseObject.data); // Pass the 'data' array to the render function
        })
        .catch(error => {
            console.error('Error fetching mitzvot:', error);
        });
}


function renderMitzvot(mitzvot) {
    const listElement = document.getElementById('mitzvot-list'); // Ensure this ID matches your HTML
    listElement.innerHTML = ''; // Clear existing content
    mitzvot.forEach(mitzvah => {
        const itemElement = document.createElement('div');
        itemElement.className = 'mitzvah-item';
        itemElement.innerHTML = `
            <h2>${mitzvah.name}</h2>
            <p>${mitzvah.description}</p>
            <button class="sponsor-button" data-mitzvah-id="${mitzvah.id}">Sponsor</button>
        `;
        listElement.appendChild(itemElement);
    });

    // Set up event listeners for the sponsor buttons
    setupSponsorButtons();
}

function setupSponsorButtons() {
    const buttons = document.querySelectorAll('.sponsor-button');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const mitzvahId = e.target.getAttribute('data-mitzvah-id');
            console.log('Sponsorship for mitzvah:', mitzvahId);
            // Here you could implement functionality to handle sponsorship, like opening a Stripe checkout
        });
    });
}

function setupMainPageEventListeners() {
    // Implement this if there are specific listeners needed for the main page
    const viewAllButton = document.getElementById('view-all-sponsorships');
    if (viewAllButton) {
        viewAllButton.addEventListener('click', () => {
            window.location.href = 'sponsorships.html'; // Adjust if the path needs to be different
        });
    }
}
