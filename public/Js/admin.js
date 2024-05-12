document.addEventListener('DOMContentLoaded', initAdminDashboard);

function initAdminDashboard() {
    setupEventListeners();
    fetchSeforim();
    fetchSponsorships('all');
}

function setupEventListeners() {
    document.getElementById('addSeferFormButton').addEventListener('click', () => toggleForm('addSeferForm'));
    document.getElementById('submitSeferButton').addEventListener('click', submitSefer);

    document.getElementById('addSponsorshipFormButton').addEventListener('click', () => toggleForm('addSponsorshipForm'));
    document.getElementById('submitSponsorshipButton').addEventListener('click', submitSponsorship);

    document.getElementById('fetchAllSponsorships').addEventListener('click', () => fetchSponsorships('all'));
    document.getElementById('fetchAvailableSponsorships').addEventListener('click', () => fetchSponsorships('available'));
    document.getElementById('fetchUnavailableSponsorships').addEventListener('click', () => fetchSponsorships('unavailable'));
}

function toggleForm(formId) {
    const form = document.getElementById(formId);
    form.classList.toggle('hidden');
}

async function submitSefer() {
    const seferName = document.getElementById('newSeferName').value.trim();
    if (!seferName) {
        alert("Sefer name is required.");
        return;
    }
    try {
        const response = await apiRequest('/api/seforim', {
            method: 'POST',
            body: JSON.stringify({ SeferName: seferName })
        });
        if (response.message) {
            alert('Sefer added successfully!');
            fetchSeforim();
            toggleForm('addSeferForm');
        }
    } catch (error) {
        console.error('Error adding sefer:', error);
        alert('Error adding sefer: ' + error.message);
    }
}

async function submitSponsorship() {
    const sponsorship = {
        SeferID: document.getElementById('newSponsorshipSeferID').value,
        Type: document.getElementById('newSponsorshipType').value,
        TypeDetail: document.getElementById('newSponsorshipDetail').value,
        Amount: parseInt(document.getElementById('newSponsorshipAmount').value, 10),
        PaymentStatus: document.getElementById('newSponsorshipPaymentStatus').value // Capture the payment status from the form
    };
    if (!sponsorship.SeferID || !sponsorship.Type || !sponsorship.TypeDetail || isNaN(sponsorship.Amount)) {
        alert("All fields are required and must be valid.");
        return;
    }
    try {
        const response = await apiRequest('/api/sponsorships', {
            method: 'POST',
            body: JSON.stringify(sponsorship)
        });
        alert('Sponsorship added successfully!');
        fetchSponsorships('all');
        toggleForm('addSponsorshipForm');
    } catch (error) {
        console.error('Error adding sponsorship:', error);
        alert('Error adding sponsorship: ' + error.message);
    }
}


async function toggleSponsorshipStatus(sponsorshipId, isSponsored) {
    try {
        const response = await apiRequest(`/api/sponsorships/${sponsorshipId}`, {
            method: 'PATCH',
            body: JSON.stringify({ IsSponsored: isSponsored })
        });
        if (response.message) {
            console.log('Sponsorship status updated successfully!');
            fetchSponsorships('all');
        }
    } catch (error) {
        console.error('Error updating sponsorship status:', error);
        alert('Error updating sponsorship status: ' + error.message);
    }
}

async function apiRequest(url, options = {}) {
    options.headers = { 'Content-Type': 'application/json' };
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to perform the request');
    }
    return await response.json();
}

async function fetchSeforim() {
    try {
        const data = await apiRequest('/api/seforim');
        displaySeforim(data.data);
    } catch (error) {
        console.error('Failed to fetch seforim:', error);
    }
}

async function fetchSponsorships(filter) {
    const url = `/api/sponsorships${filter !== 'all' ? `?isSponsored=${filter === 'available' ? 'false' : 'true'}` : ''}`;
    try {
        const data = await apiRequest(url);
        displaySponsorships(data.data);
    } catch (error) {
        console.error('Failed to fetch sponsorships:', error);
    }
}

function displaySeforim(seforim) {
    const list = document.getElementById('seforimList');
    list.innerHTML = seforim.map(sefer => `<div><p>${sefer.SeferName} <button onclick="deleteSefer(${sefer.SeferID})">Delete</button></p></div>`).join('');
}

function displaySponsorships(sponsorships) {
    const list = document.getElementById('sponsorshipsList');
    list.innerHTML = sponsorships.map(sponsorship => `<div><p>ID: ${sponsorship.SponsorshipID} - ${sponsorship.TypeDetail} - $${sponsorship.Amount / 100}</p><p>Status: ${sponsorship.IsSponsored ? `Sponsored by ${sponsorship.SponsorName}` : 'Available'}</p><button onclick="toggleSponsorshipStatus(${sponsorship.SponsorshipID}, ${!sponsorship.IsSponsored})">Toggle Status</button><button onclick="deleteSponsorship(${sponsorship.SponsorshipID})">Delete</button></div>`).join('');
}


async function deleteSefer(seferId) {
    try {
        const response = await apiRequest(`/api/seforim/${seferId}`, { method: 'DELETE' });
        if (response.message) {
            alert('Sefer deleted successfully!');
            fetchSeforim();
        }
    } catch (error) {
        console.error('Error deleting sefer:', error);
        alert('Error deleting sefer: ' + error.message);
    }
}

async function deleteSponsorship(sponsorshipId) {
    try {
        const response = await apiRequest(`/api/sponsorships/${sponsorshipId}`, { method: 'DELETE' });
        if (response.message) {
            alert('Sponsorship deleted successfully!');
            fetchSponsorships('all');  // Refresh the list
        }
    } catch (error) {
        console.error('Failed to delete sponsorship:', error);
        alert('Error deleting sponsorship: ' + error.message);
    }
}
