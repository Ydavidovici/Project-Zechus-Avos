document.addEventListener('DOMContentLoaded', function() {
    fetchAvailableSponsorships();
});

function fetchAvailableSponsorships() {
    fetch('/api/sponsorships?seferId=2&isSponsored=false')
        .then(response => response.json())
        .then(data => displaySponsorships(data.data))
        .catch(error => console.error('Error fetching sponsorships:', error));
}

function displaySponsorships(sponsorships) {
    const container = document.getElementById('sponsorship-list');
    container.innerHTML = '';
    sponsorships.forEach(sponsorship => {
        const sponsorshipElement = document.createElement('div');
        sponsorshipElement.innerHTML = `
            <p>${sponsorship.TypeDetail} - $${sponsorship.Amount / 100}</p>
            <button onclick="sponsorSponsorship(${sponsorship.SponsorshipID}, ${sponsorship.Amount})">Sponsor This Parshah</button>
        `;
        container.appendChild(sponsorshipElement);
    });
}

function sponsorSponsorship(sponsorshipId, amount) {
    const sponsorInfo = getSponsorInfo();
    if (!sponsorInfo) return;

    createPaymentLink({
        description: `Sponsorship for Parshah ID: ${sponsorshipId}`,
        amount: amount,
        metadata: { ...sponsorInfo, sponsorshipId }
    });
}

function getSponsorInfo() {
    // Collect sponsor info from a form or input fields
    return {
        name: document.getElementById('sponsorName').value,
        contact: document.getElementById('sponsorContact').value,
        forWhom: document.getElementById('forWhom').value
    };
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
