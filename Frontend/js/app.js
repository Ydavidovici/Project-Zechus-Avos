document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('sponsorships.html') || window.location.pathname.endsWith('sponsorships')) {
        fetchAndDisplayMitzvot();
        setupStripe();
        setupModalInteractions();
    }
});

function fetchAndDisplayMitzvot() {
    console.log("Fetching mitzvot from API");
    fetch('http://localhost:3000/api/mitzvot')
        .then(response => response.json())
        .then(data => {
            console.log("Received response from API", data);
            renderMitzvot(data.data);
        })
        .catch(error => console.error('Error fetching mitzvot:', error));
}

function renderMitzvot(mitzvot) {
    const listElement = document.getElementById('mitzvot-list');
    listElement.innerHTML = '';
    mitzvot.forEach(mitzvah => {
        console.log("Processing mitzvah: ", mitzvah.name);
        const itemElement = document.createElement('div');
        itemElement.className = 'mitzvah-item';
        itemElement.innerHTML = `
            <h2>${mitzvah.name}</h2>
            <p>${mitzvah.description}</p>
            <button class="sponsor-button" data-mitzvah-id="${mitzvah.id}" data-mitzvah-name="${mitzvah.name}">Sponsor</button>
        `;
        itemElement.addEventListener('click', function() {
            openSponsorModal(mitzvah.id, mitzvah.name, mitzvah.description);
        });
        listElement.appendChild(itemElement);
    });
}

function setupStripe() {
    const stripe = Stripe('your_stripe_public_key');
    const elements = stripe.elements();
    const card = elements.create('card');
    card.mount('#card-element');

    card.on('change', ({error}) => {
        document.getElementById('card-errors').textContent = error ? error.message : '';
    });

    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Insert Stripe payment submission logic here
    });
}


document.getElementById('mitzvot-list').addEventListener('click', function(event) {
    // Check if the clicked element is a mitzvah
    if (event.target.classList.contains('mitzvah')) {
        // Perform your changes here
        event.target.style.color = 'red';
    }
});

function openSponsorModal(id, name, description) {
    // Get the modal element
    const modal = document.getElementById('sponsor-modal');

    if (modal === null) {
        console.error('No element with id "sponsor-modal" found');
        return;
    }

    // Populate the modal with the mitzvah details
    modal.querySelector('.mitzvah-name').textContent = name;
    modal.querySelector('.mitzvah-description').textContent = description;

    // Show the modal
    modal.style.display = 'block';
}
