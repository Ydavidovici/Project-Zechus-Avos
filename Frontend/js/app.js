document.addEventListener('DOMContentLoaded', () => {
    // Initialize actions only if on the sponsorship page.
    if (window.location.pathname.endsWith('sponsorships.html') || window.location.pathname.endsWith('sponsorships')) {
        fetchAndDisplayMitzvot();
        setupStripe();
        setupModalInteractions();
    }
});

function fetchAndDisplayMitzvot() {
    // Fetch mitzvot from your API and display them.
    // Example API call:
    fetch('http://localhost:3000/api/mitzvot')
        .then(response => response.json())
        .then(data => renderMitzvot(data.mitzvot))
        .catch(error => console.error('Error fetching mitzvot:', error));
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
    const stripe = Stripe('pk_test_YourPublishableKeyHere'); // Replace with your actual key
    const elements = stripe.elements();
    const card = elements.create('card');
    card.mount('#card-element');

    card.on('change', ({error}) => {
        const displayError = document.getElementById('card-errors');
        if (error) {
            displayError.textContent = error.message;
        } else {
            displayError.textContent = '';
        }
    });

    document.getElementById('payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
      
        // Set the amount for the sponsorship
        let amount = 5000; // $50 in cents
      
        // Call your server endpoint to create a payment intent
        const response = await fetch('/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: amount }),
        });
        const data = await response.json();
      
        if (data.clientSecret) {
          // Proceed with the payment using the client secret
          const result = await stripe.confirmCardPayment(data.clientSecret, {
            payment_method: {
              card: card,
              billing_details: {
                // Include billing details here
              },
            },
          });
      
          if (result.error) {
            // Handle errors in payment
            console.log(result.error.message);
          } else {
            if (result.paymentIntent.status === 'succeeded') {
              // Payment was successful
              console.log('Payment succeeded!');
              // Show a success message or redirect to a success page
            }
          }
        } else {
          // Handle error in creating payment intent
          console.error('Failed to create payment intent.');
        }
    });
} // Missing closing brace added here

function setupModalInteractions() {
    // Handle closing sponsorship modal
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('sponsorModal').style.display = 'none';
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target == document.getElementById('sponsorModal')) {
            document.getElementById('sponsorModal').style.display = 'none';
        }
    });
}

function openSponsorModal(mitzvahId) {
    // Populate modal with relevant mitzvah details if necessary
    document.getElementById('mitzvahIdField').value = mitzvahId; // mitzvahId used here
    document.getElementById('sponsorModal').style.display = 'block';
}

// Add any additional unchanged functions or utilities below as necessary.
