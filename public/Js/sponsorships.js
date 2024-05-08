// sponsorships.js - Shared script for handling sponsorships on both pages

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
        createPaymentLink({
            description: description,
            amount: amount,
            metadata: { ...sponsorInfo, sponsorshipId }
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

function createPaymentLink(data) {
    fetch('/api/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.url) window.location.href = data.url;
        })
        .catch(error => console.error('Error creating payment link:', error));
}


function sponsorCover() {
    const sponsorName = document.getElementById('sponsorName').value;
    const sponsorContact = document.getElementById('sponsorContact').value;

    if (!sponsorName || !sponsorContact) {
        alert("Please fill in all required fields.");
        return;
    }

    const sponsorshipDetails = {
        description: "Book Cover Sponsorship",
        amount: 1800000, // Amount in cents ($18,000)
        metadata: {
            sponsorName,
            sponsorContact,
            sponsorshipType: 'Book Cover'
        }
    };

    createPaymentLink(sponsorshipDetails);
}
