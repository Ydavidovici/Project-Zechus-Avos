// sponsorships.js - Updated script for handling sponsorships using Stripe Checkout

document.addEventListener('DOMContentLoaded', function() {
    const seferId = document.body.dataset.seferId; // Use a data attribute on the <body> tag for seferId
    fetchAvailableSponsorships(seferId);
});

function fetchAvailableSponsorships(seferId) {
    fetch(`/api/sponsorships?seferId=${seferId}&isSponsored=false`)
        .then(response => response.json())
        .then(data => displaySponsorships(data.data))
        .catch(error => console.error('Error fetching sponsorships:', error));
}

function displaySponsorships(sponsorships) {
    const container = document.getElementById('sponsorshipsList');
    if (sponsorships.length === 0) {
        container.innerHTML = '<p>No available sponsorships at this time.</p>';
        return;
    }
    container.innerHTML = '';
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
    if (!sponsorInfo) return;
    markSponsorshipAsPledged(sponsorshipId, sponsorInfo, () => {
        initiateCheckout({
            items: [{
                name: "Sponsorship",
                amount: amount,
                quantity: 1
            }],
            successUrl: 'https://yourdomain.com/success', // Make sure these URLs are set correctly
            cancelUrl: 'https://yourdomain.com/cancel'
        });
    });
}

function getSponsorInfo() {
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

function initiateCheckout(sessionData) {
    fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.sessionId) {
                redirectToStripe(data.sessionId);
            }
        })
        .catch(error => console.error('Error initiating checkout:', error));
}

function redirectToStripe(sessionId) {
    const stripe = Stripe('pk_test_your_public_key_here'); // Replace with your public Stripe key
    stripe.redirectToCheckout({
        sessionId: sessionId
    }).then((result) => {
        if (result.error) {
            alert(result.error.message);
        }
    });
}
