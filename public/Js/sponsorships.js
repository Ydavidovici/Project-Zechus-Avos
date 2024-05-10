document.addEventListener('DOMContentLoaded', function() {
    const seferId = document.body.getAttribute('data-sefer-id');
    console.log('SeferID retrieved:', seferId);
    loadSponsorships(seferId);
});

async function fetchAvailableSponsorships(seferId) {
    console.log(`Fetching sponsorships for SeferID: ${seferId}`);
    const response = await fetch(`/api/sponsorships?isSponsored=false&seferId=${seferId}`);
    if (!response.ok) throw new Error('Failed to fetch sponsorships');
    const { data } = await response.json();
    console.log('Data received:', data);
    return data;
}

async function loadSponsorships(seferId) {
    try {
        console.log('Loading sponsorships...');
        const sponsorships = await fetchAvailableSponsorships(seferId);
        console.log('Sponsorships:', sponsorships);
        sponsorships.forEach(sponsorship => displaySponsorship(sponsorship));
    } catch (error) {
        console.error('Failed to load sponsorships:', error);
        alert('Could not load sponsorships.');
    }
}

function displaySponsorship(sponsorship) {
    const container = document.getElementById('sponsorshipsList');
    const formattedAmount = formatCurrency(sponsorship.Amount);
    const sponsorshipElement = document.createElement('div');
    sponsorshipElement.innerHTML = `
        <p>${sponsorship.TypeDetail} - ${formattedAmount}</p>
        <button id="sponsorBtn-${sponsorship.SponsorshipID}">Sponsor This</button>
    `;
    container.appendChild(sponsorshipElement);

    document.getElementById(`sponsorBtn-${sponsorship.SponsorshipID}`).addEventListener('click', () => {
        openModal(sponsorship);
    });
}

function openModal(sponsorship) {
    const modal = document.getElementById('sponsorModal');
    modal.style.display = 'block';

    // Store sponsorship data in sessionStorage
    sessionStorage.setItem('currentSponsorship', JSON.stringify(sponsorship));

    document.getElementById('sponsorForm').onsubmit = function(event) {
        event.preventDefault();
        submitSponsorship();  // No longer pass sponsorship directly
    };

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

async function submitSponsorship() {
    const sponsorship = JSON.parse(sessionStorage.getItem('currentSponsorship'));
    console.log('Submitting sponsorship:', sponsorship);

    const sponsorName = document.getElementById('sponsorName').value.trim();
    const forWhom = document.getElementById('forWhom').value.trim();

    if (!sponsorName || !forWhom || !sponsorship) {
        console.error('Required fields are missing');
        alert('Please fill in all required fields.');
        return;
    }

    const items = [{
        description: `Sponsorship for ${sponsorship.TypeDetail}: ${forWhom} by ${sponsorName}`,
        amount: sponsorship.Amount,
        metadata: { sponsorName, forWhom, sponsorshipId: sponsorship.SponsorshipID }
    }];

    console.log('Items prepared for session:', items);  // Confirm items structure
    try {
        const session = await createStripeSession(items);
        if (session.url) {
            window.location.href = session.url;
        } else {
            console.error('No URL received:', session);
            alert('Failed to redirect to checkout.');
        }
    } catch (error) {
        console.error('Checkout initiation failed:', error);
        alert('Failed to initiate checkout. Please try again.');
    }
}


// Ensure to clear sessionStorage when appropriate
window.onunload = function() {
    sessionStorage.removeItem('currentSponsorship');
};


function formatCurrency(amount) {
    return `$${(amount / 100).toFixed(2)}`;
}

async function createStripeSession(items) {
    console.log('Sending these items to the server:', items);
    const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, successUrl: window.location.origin + '/success', cancelUrl: window.location.href })
    });
    const jsonResponse = await response.json();
    if (!response.ok) {
        throw new Error('Failed to create checkout session: ' + jsonResponse.error);
    }
    return jsonResponse;
}

