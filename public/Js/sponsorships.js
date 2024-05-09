// sponsorships.js - Handles sponsorships and checkout using Stripe Checkout

let stripeInstance = null; // Store Stripe instance globally

document.addEventListener('DOMContentLoaded', async function() {
    const stripeConfig = await fetchStripeConfig();
    stripeInstance = Stripe(stripeConfig.publicKey); // Initialize Stripe with fetched public key
    const seferId = document.body.dataset.seferId; // Use a data attribute on the <body> tag for seferId
    fetchAvailableSponsorships(seferId); // Load sponsorships based on the seferId
});

async function fetchStripeConfig() {
    const response = await fetch('/config/stripe'); // Endpoint to fetch public Stripe key
    const config = await response.json();
    return config; // Return the entire config object
}

function fetchAvailableSponsorships(seferId) {
    fetch(`/api/sponsorships?seferId=${seferId}&isSponsored=false`)
        .then(response => response.json())
        .then(data => displaySponsorships(data.data))
        .catch(error => console.error('Error fetching sponsorships:', error));
}

function displaySponsorships(sponsorships) {
    const container = document.getElementById('sponsorshipsList');
    container.innerHTML = sponsorships.length === 0 ? '<p>No available sponsorships at this time.</p>' : '';
    sponsorships.forEach(sponsorship => {
        const sponsorshipElement = document.createElement('div');
        sponsorshipElement.innerHTML = `
            <p>${sponsorship.TypeDetail} - $${sponsorship.Amount / 100}</p>
            <button onclick="sponsorSponsorship(${sponsorship.SponsorshipID}, ${sponsorship.Amount})">Sponsor This</button>
        `;
        container.appendChild(sponsorshipElement);
    });
}

function sponsorSponsorship(sponsorshipId, amount) {
    const sponsorInfo = getSponsorInfo();
    if (!sponsorInfo) return; // Stop if sponsor info is invalid
    markSponsorshipAsPledged(sponsorshipId, sponsorInfo, () => {
        initiateCheckout([
            {
                description: "Sponsorship for " + sponsorInfo.forWhom,
                amount: amount,
                quantity: 1,
                metadata: {
                    sponsorshipId: sponsorshipId,
                    sponsorName: sponsorInfo.name,
                    sponsorContact: sponsorInfo.contact
                }
            }
        ]);
    });
}

function getSponsorInfo() {
    if (!document.getElementById('sponsorName').value || !document.getElementById('sponsorContact').value) {
        alert('Please fill in all required fields.');
        return null;
    }
    return {
        name: document.getElementById('sponsorName').value,
        contact: document.getElementById('sponsorContact').value,
        forWhom: document.getElementById('forWhom').value
    };
}

function markSponsorshipAsPledged(sponsorshipId, sponsorInfo, callback) {
    fetch(`/api/sponsorships/${sponsorshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...sponsorInfo,
            IsSponsored: true,
            PaymentStatus: 'Pledged'
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'success') {
                callback();
            } else {
                console.error('Failed to update sponsorship status:', data);
                alert('Failed to initiate sponsorship. Please try again.');
            }
        })
        .catch(error => console.error('Error updating sponsorship status:', error));
}

function initiateCheckout(items) {
    const successUrl = 'https://projectzechusavos.org/success';
    const cancelUrl = 'https://projectzechusavos.org/cancel';

    fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, successUrl, cancelUrl })
    })
        .then(response => response.json())
        .then(data => {
            if (data.sessionId) {
                redirectToStripe(data.sessionId);
            } else {
                alert('Error initiating checkout session.');
            }
        })
        .catch(error => console.error('Error initiating checkout:', error));
}

function redirectToStripe(sessionId) {
    stripeInstance.redirectToCheckout({
        sessionId: sessionId
    }).then((result) => {
        if (result.error) {
            alert(result.error.message);
        }
    });
}
