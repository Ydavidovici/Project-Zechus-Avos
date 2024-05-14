document.addEventListener('DOMContentLoaded', function() {
    const seferId = document.body.getAttribute('data-sefer-id');
    loadSponsorships(seferId);
});

async function fetchAvailableSponsorships(seferId) {
    try {
        const response = await fetch(`/api/sponsorships?isSponsored=false&seferId=${seferId}`);
        if (!response.ok) throw new Error('Failed to fetch sponsorships');
        const { data } = await response.json();

        // Log the response data for debugging
        console.log('Fetched Sponsorships:', data);

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
        logMessage(`Load Error: ${error.message}`);
    }
}

function displaySponsorship(sponsorship) {
    const container = document.getElementById('sponsorshipsList');
    if (typeof sponsorship.Amount !== 'number') {
        console.error('Invalid sponsorship amount:', sponsorship.Amount);
        return;
    }
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
        description: `Sponsorship for ${sponsorship.TypeDetail}: ${forWhom} by ${sponsorName}`,
        amount: sponsorship.Amount,
        metadata: { sponsorName, forWhom, sponsorshipId: sponsorship.SponsorshipID }
    }];
    try {
        const session = await createStripeSession(items);
        if (session.url) {
            window.location.href = session.url;
        } else {
            alert('Failed to redirect to checkout.');
        }
    } catch (error) {
        alert('Failed to initiate checkout. Please try again.');
    }
}

function formatCurrency(amount) {
    return `$${(amount / 100).toFixed(2)}`;
}

async function createStripeSession(items) {
    const sponsorship = JSON.parse(sessionStorage.getItem('currentSponsorship'));
    try {
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items,
                metadata: {
                    sponsorshipId: sponsorship.SponsorshipID,
                    sponsorName: document.getElementById('sponsorName').value.trim(),
                    forWhom: document.getElementById('forWhom').value.trim()
                },
                successUrl: window.location.origin + '/success',
                cancelUrl: window.location.href
            })
        });
        const jsonResponse = await response.json();
        if (!response.ok) {
            throw new Error('Failed to create checkout session: ' + jsonResponse.error);
        }
        return jsonResponse;
    } catch (error) {
        throw error;
    }
}
