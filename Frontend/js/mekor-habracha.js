document.addEventListener('DOMContentLoaded', function() {
    fetchAvailableSponsorships();
});

function fetchAvailableSponsorships() {
    fetch('/api/sponsorships?seferId=1&isSponsored=false')
        .then(response => response.json())
        .then(data => displaySponsorships(data.data))
        .catch(error => console.error('Error fetching sponsorships:', error));
}

function displaySponsorships(sponsorships) {
    const container = document.getElementById('sponsorshipsList');
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

    createPaymentLink({
        description: `Sponsorship ID: ${sponsorshipId}`,
        amount: amount,
        metadata: { ...sponsorInfo, sponsorshipId }
    });
}

function getSponsorInfo() {
    // Example fields, ensure you have these fields in your HTML or gather this info another way
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


function sendEmail(to, subject, message) {
    fetch('/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to, subject, message })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Email sent successfully');
            } else {
                console.error('Failed to send email');
            }
        })
        .catch(error => {
            console.error('Error sending email:', error);
        });
}
