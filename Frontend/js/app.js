document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('sponsorships.html') || window.location.pathname.endsWith('sponsorships')) {
        fetchAndDisplayMitzvot();
        setupStripe();
        setupModalInteractions();
    }
});
function fetchAndDisplayMitzvot() {
    fetch('http://localhost:3005/api/mitzvot')
        .then(response => response.json())
        .then(data => {
            // Access the 'data' property of the response to get the mitzvot array
            renderMitzvot(data.data); // Adjust this line accordingly
        })
        .catch(error => console.error('Error fetching mitzvot:', error));
}


function renderMitzvot(mitzvot) {
    const listElement = document.getElementById('mitzvot-list');
    if (!listElement) {
        console.error('Mitzvot list element not found');
        return;
    }

    listElement.innerHTML = '';

    mitzvot.forEach(mitzvah => {
        const itemElement = document.createElement('div');
        itemElement.className = 'mitzvah-item';
        itemElement.innerHTML = `
            <div class="mitzvah-summary">
                <h2>${mitzvah.name}</h2>
                <p>${mitzvah.description}</p>
                <button class="sponsor-button" data-mitzvah-id="${mitzvah.id}">Sponsor</button>
            </div>
        `;
        listElement.appendChild(itemElement);

        itemElement.querySelector('.sponsor-button').addEventListener('click', (e) => {
            e.stopPropagation();
            openSponsorModal(mitzvah.id);
        });
    });
}

function setupStripe() {
    const stripe = Stripe('pk_test_51OttAEBCnbGynt76qe6NPybRBhwjR7NPeSsZhBt3ATCRZERVYZdrL6Texwkp5yL120pYbyHOO44D4awkfnxCyTJ500UMCypzs0');
    const elements = stripe.elements();
    const card = elements.create('card');
    card.mount('#card-element');

    card.on('change', ({error}) => {
        const displayError = document.getElementById('card-errors');
        displayError.textContent = error ? error.message : '';
    });

    document.getElementById('payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        let amount = document.getElementById('amount').value || '5000'; // Example fallback amount

        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({amount: amount})
        });

        const data = await response.json();

        if (data.clientSecret) {
            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: card,
                    billing_details: {}
                },
            });

            if (result.error) {
                console.error(result.error.message);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    alert('Thank you for your sponsorship!');
                    document.getElementById('sponsorModal').style.display = 'none';
                }
            }
        } else {
            console.error('Failed to create payment intent.');
        }
    });
}

function setupModalInteractions() {
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('sponsorModal').classList.add('hidden');
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === document.getElementById('sponsorModal')) {
            document.getElementById('sponsorModal').classList.add('hidden');
        }
    });
}

function openSponsorModal(mitzvahId) {
    const modal = document.getElementById('sponsorModal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Sponsor modal not found');
    }
}
