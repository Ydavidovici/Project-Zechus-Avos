document.addEventListener('DOMContentLoaded', function() {
    const seferId = document.body.getAttribute('data-sefer-id');
    if (seferId) {
        loadSponsorships(seferId);
    } else {
        console.error('No sefer ID found on the page.');
    }
});

async function fetchAvailableSponsorships(seferId) {
    try {
        const response = await fetch(`/api/sponsorships?isSponsored=false&seferId=${seferId}`);
        if (!response.ok) throw new Error('Failed to fetch sponsorships');
        const { data } = await response.json();
        return data;
    } catch (error) {
        alert('Could not load sponsorships.');
        throw error;
    }
}

async function loadSponsorships(seferId) {
    try {
        const sponsorships = await fetchAvailableSponsorships(seferId);
        sponsorships.forEach(sponsorship => displaySponsorship(sponsorship));
    } catch (error) {
        console.error(`Load Error: ${error.message}`);
    }
}

function displaySponsorship(sponsorship) {
    const container = document.getElementById('sponsorshipsList');
    const formattedAmount = formatCurrency(sponsorship.amount);
    const sponsorshipElement = document.createElement('div');
    sponsorshipElement.innerHTML = `
        <p>${sponsorship.typedetail} - ${formattedAmount}</p>
        <button id="sponsorBtn-${sponsorship.sponsorshipid}">Sponsor This</button>
    `;
    container.appendChild(sponsorshipElement);

    document.getElementById(`sponsorBtn-${sponsorship.sponsorshipid}`).addEventListener('click', () => {
        openModal(sponsorship);
    });
}

function formatCurrency(amount) {
    if (amount === undefined || isNaN(amount)) {
        console.error('Invalid amount:', amount);
        return 'Invalid amount';
    }
    return `$${(amount / 100).toFixed(2)}`;
}

function openModal(sponsorship) {
    const modal = document.getElementById('sponsorModal');
    modal.style.display = 'block';
    sessionStorage.setItem('currentSponsorship', JSON.stringify(sponsorship));
    document.getElementById('sponsorForm').onsubmit = function(event) {
        event.preventDefault();
        submitSponsorship();
    };
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

async function submitSponsorship() {
    const sponsorship = JSON.parse(sessionStorage.getItem('currentSponsorship'));
    const sponsorName = document.getElementById('sponsorName').value.trim();
    const forWhom = document.getElementById('forWhom').value.trim();

    if (!sponsorName || !forWhom || !sponsorship) {
        alert('Please fill in all required fields.');
        return;
    }

    const items = [{
        price_data: {
            currency: 'usd',
            product_data: {
                name: `Sponsorship for ${sponsorship.typedetail}: ${forWhom} by ${sponsorName}`
            },
            unit_amount: sponsorship.amount
        },
        quantity: 1
    }];

    const metadata = {
        sponsorshipId: sponsorship.sponsorshipid,
        sponsorName: sponsorName,
        forWhom: forWhom
    };

    try {
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items,
                metadata,
                successUrl: window.location.origin + '/html/success.html',
                cancelUrl: window.location.origin + '/html/cancel.html'
            })
        });

        const jsonResponse = await response.json();
        if (!response.ok) {
            throw new Error('Failed to create checkout session: ' + jsonResponse.error);
        }

        window.location.href = jsonResponse.url;
    } catch (error) {
        alert('Failed to initiate checkout. Please try again.');
    }
}

async function createStripeSession(items) {
    const sponsorship = JSON.parse(sessionStorage.getItem('currentSponsorship'));
    try {
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items,
                metadata: {
                    sponsorshipId: sponsorship.sponsorshipid,
                    sponsorName: document.getElementById('sponsorName').value.trim(),
                    forWhom: document.getElementById('forWhom').value.trim()
                },
                successUrl: window.location.origin + '/success.html',
                cancelUrl: window.location.href
            })
        });
        const jsonResponse = await response.json();
        if (!response.ok) {
            throw new Error('Failed to create checkout session: ' + jsonResponse.error);
        }
        return jsonResponse;
    } catch (error) {
        console.error('Error in createStripeSession:', error);
        throw error;
    }
}
