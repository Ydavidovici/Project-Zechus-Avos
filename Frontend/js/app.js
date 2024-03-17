document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the sponsorships page and only then fetch and display mitzvot
    if (window.location.pathname.endsWith('sponsorships.html') || window.location.pathname.endsWith('sponsorships')) {
        fetchAndDisplayMitzvot();
    }

    // Setup listeners for the main page if needed
    setupMainPageEventListeners();
    // Setup to close modal when clicking outside of the modal content
    setupModalClose();
});

function fetchAndDisplayMitzvot() {
    fetch('http://localhost:3000/api/mitzvot')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(responseObject => {
            renderMitzvot(responseObject.data);
        })
        .catch(error => {
            console.error('Error fetching mitzvot:', error);
        });
}

function renderMitzvot(mitzvot) {
    const listElement = document.getElementById('mitzvot-list');
    listElement.innerHTML = '';
    mitzvot.forEach(mitzvah => {
        const itemElement = document.createElement('div');
        itemElement.className = 'mitzvah-item';
        itemElement.innerHTML = `
            <div class="mitzvah-summary">
                <h2>${mitzvah.name}</h2>
                <p>${mitzvah.description}</p>
            </div>
        `;
        const sponsorButton = document.createElement('button');
        sponsorButton.className = 'sponsor-button';
        sponsorButton.textContent = 'Sponsor';
        sponsorButton.dataset.mitzvahId = mitzvah.id;
        
        itemElement.appendChild(sponsorButton);

        listElement.appendChild(itemElement);

        // Click event for showing modal details
        itemElement.addEventListener('click', function() {
            showModal(mitzvah);
        });

        sponsorButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering the item's click event
            console.log('Sponsorship for mitzvah:', this.dataset.mitzvahId);
            // Here, you can implement further sponsorship functionality, such as opening a Stripe checkout
        });
    });
}

function setupSponsorButtons() {
    // This function might not be necessary if sponsor button setup is moved into renderMitzvot
}

function setupMainPageEventListeners() {
    const viewAllButton = document.getElementById('view-all-sponsorships');
    if (viewAllButton) {
        viewAllButton.addEventListener('click', () => {
            window.location.href = 'sponsorships.html';
        });
    }
}

function showModal(mitzvah) {
    const modal = document.getElementById('mitzvahModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');

    modalTitle.textContent = mitzvah.name;
    modalDescription.textContent = mitzvah.description;

    modal.classList.remove('hidden');
}

function hideModal() {
    const modal = document.getElementById('mitzvahModal');
    modal.classList.add('hidden');
}

function setupModalClose() {
    const modal = document.getElementById('mitzvahModal');
    modal.querySelector('.close-modal').addEventListener('click', hideModal);

    // Close modal when clicking outside of the modal content
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            hideModal();
        }
    });
}
