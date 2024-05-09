// admin.js - Handles admin panel operations for Seforim and Sponsorships

document.addEventListener('DOMContentLoaded', function() {
    initAdminDashboard();
});

function initAdminDashboard() {
    document.getElementById('addSeferFormButton').addEventListener('click', () => toggleFormDisplay('addSeferForm'));
    document.getElementById('submitSeferButton').addEventListener('click', addSefer);

    document.getElementById('addSponsorshipFormButton').addEventListener('click', () => toggleFormDisplay('addSponsorshipForm'));
    document.getElementById('submitSponsorshipButton').addEventListener('click', addSponsorship);

    document.getElementById('fetchAllSponsorships').addEventListener('click', () => fetchSponsorships('all'));
    document.getElementById('fetchAvailableSponsorships').addEventListener('click', () => fetchSponsorships('available'));
    document.getElementById('fetchUnavailableSponsorships').addEventListener('click', () => fetchSponsorships('unavailable'));

    fetchSeforim();
    fetchSponsorships('all');
}

function toggleFormDisplay(formId) {
    const form = document.getElementById(formId);
    form.style.display = form.style.display === 'block' ? 'none' : 'block';
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: {'Content-Type': 'application/json'},
        ...options
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred');
    }
    return response.json();
}

// Seforim functions
async function fetchSeforim() {
    try {
        const data = await apiRequest('/api/seforim');
        displaySeforim(data.data);
    } catch (error) {
        displayError(error, 'seforimList');
    }
}

function displaySeforim(seforim) {
    const list = document.getElementById('seforimList');
    list.innerHTML = seforim.map(sefer => `
        <div>
            <p>${sefer.SeferName} <button onclick="deleteSefer(${sefer.SeferID})">Delete</button></p>
        </div>
    `).join('');
}

async function addSefer() {
    const seferName = document.getElementById('newSeferName').value;
    try {
        await apiRequest('/api/seforim', {
            method: 'POST',
            body: JSON.stringify({ SeferName: seferName })
        });
        fetchSeforim();
        toggleFormDisplay('addSeferForm');
    } catch (error) {
        displayError(error, 'seforimList');
    }
}

async function deleteSefer(seferId) {
    try {
        await apiRequest(`/api/seforim/${seferId}`, { method: 'DELETE' });
        fetchSeforim();
    } catch (error) {
        displayError(error, 'seforimList');
    }
}

// Sponsorship functions
async function fetchSponsorships(filter = 'all') {
    let url = '/api/sponsorships';
    if (filter !== 'all') {
        url += `?isSponsored=${filter === 'available' ? 'false' : 'true'}`;
    }
    try {
        const data = await apiRequest(url);
        displaySponsorships(data.data);
    } catch (error) {
        displayError(error, 'sponsorshipsList');
    }
}

function displaySponsorships(sponsorships) {
    const list = document.getElementById('sponsorshipsList');
    list.innerHTML = sponsorships.map(sponsorship => `
        <div>
            <p>ID: ${sponsorship.SponsorshipID} - Sefer ID: ${sponsorship.SeferID} - ${sponsorship.Type} - ${sponsorship.TypeDetail} - $${sponsorship.Amount / 100}</p>
            <p>Status: ${sponsorship.IsSponsored ? `Sponsored by ${sponsorship.SponsorName}` : 'Available'}</p>
            <button onclick="updateSponsorshipStatus(${sponsorship.SponsorshipID}, !${sponsorship.IsSponsored})">Toggle Status</button>
            <button onclick="deleteSponsorship(${sponsorship.SponsorshipID})">Delete</button>
        </div>
    `).join('');
}

async function addSponsorship() {
    const sponsorship = {
        SeferID: document.getElementById('newSponsorshipSeferID').value,
        Type: document.getElementById('newSponsorshipType').value,
        TypeDetail: document.getElementById('newSponsorshipDetail').value,
        Amount: document.getElementById('newSponsorshipAmount').value
    };
    try {
        await apiRequest('/api/sponsorships', {
            method: 'POST',
            body: JSON.stringify(sponsorship)
        });
        fetchSponsorships('all');
        toggleFormDisplay('addSponsorshipForm');
    } catch (error) {
        displayError(error, 'sponsorshipsList');
    }
}

async function updateSponsorshipStatus(id, isSponsored) {
    try {
        await apiRequest(`/api/sponsorships/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ IsSponsored: isSponsored })
        });
        fetchSponsorships('all');
    } catch (error) {
        displayError(error, 'sponsorshipsList');
    }
}

async function deleteSponsorship(id) {
    try {
        await apiRequest(`/api/sponsorships/${id}`, { method: 'DELETE' });
        fetchSponsorships('all');
    } catch (error) {
        displayError(error, 'sponsorshipsList');
    }
}

function displayError(error, elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<p>Error: ${error.message || 'An unknown error occurred'}</p>`;
}
