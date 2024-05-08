// Utility Functions for API Requests
function apiRequest(url, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    const settings = {
        ...options,
        headers: defaultHeaders
    };

    return fetch(url, settings)
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => Promise.reject(error));
            }
            return response.json();
        });
}

// DOMContentLoaded to ensure the DOM is fully loaded before scripts run
document.addEventListener('DOMContentLoaded', function() {
    initAdminDashboard();
});

function initAdminDashboard() {
    fetchSeforim();
    fetchSponsorships();
    document.getElementById('addSeferFormButton').addEventListener('click', showAddSeferForm);
    document.getElementById('addSponsorshipFormButton').addEventListener('click', showAddSponsorshipForm);
}

// Seforim Functions
function fetchSeforim() {
    apiRequest('/api/seforim')
        .then(data => displaySeforim(data.data))
        .catch(error => displayError(error, 'seforimList'));
}

function displaySeforim(seforim) {
    const list = document.getElementById('seforimList');
    list.innerHTML = ''; // Clear existing entries
    seforim.forEach(sefer => {
        const item = document.createElement('div');
        item.innerHTML = `
            <p>${sefer.SeferName} <button onclick="deleteSefer(${sefer.SeferID})">Delete</button></p>
        `;
        list.appendChild(item);
    });
}

function showAddSeferForm() {
    document.getElementById('addSeferForm').style.display = 'block';
}

function addSefer() {
    const seferName = document.getElementById('newSeferName').value;
    apiRequest('/api/seforim', {
        method: 'POST',
        body: JSON.stringify({ SeferName: seferName })
    })
        .then(() => {
            fetchSeforim();  // Refresh the list
            document.getElementById('addSeferForm').style.display = 'none';
        })
        .catch(error => displayError(error, 'seforimList'));
}

function deleteSefer(seferId) {
    apiRequest(`/api/seforim/${seferId}`, { method: 'DELETE' })
        .then(() => fetchSeforim())  // Refresh the list
        .catch(error => displayError(error, 'seforimList'));
}

async function fetchSponsorships(filter = 'all') {
    let url = '/api/sponsorships';
    if (filter === 'available') {
        url += '?isSponsored=false';
    } else if (filter === 'unavailable') {
        url += '?isSponsored=true';
    }

    try {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.style.display = 'block'; // Show loading indicator

        const data = await apiRequest(url);
        displaySponsorships(data.data);

        loadingIndicator.style.display = 'none'; // Hide loading indicator
    } catch (error) {
        displayError(error, 'sponsorshipsList');
        loadingIndicator.style.display = 'none';
    }
}

function displaySponsorships(sponsorships) {
    const list = document.getElementById('sponsorshipsList');
    list.innerHTML = '';  // Clear previous entries
    sponsorships.forEach(sponsorship => {
        const item = document.createElement('div');
        item.innerHTML = `
            <p>ID: ${sponsorship.SponsorshipID}</p>
            <p>Sefer ID: ${sponsorship.SeferID}</p>
            <p>Type: ${sponsorship.Type}</p>
            <p>Detail: ${sponsorship.TypeDetail}</p>
            <p>Amount: $${sponsorship.Amount / 100}</p>
            <p>Status: ${sponsorship.IsSponsored ? `Sponsored by ${sponsorship.SponsorName} for ${sponsorship.ForWhom}` : 'Available'}</p>
            <button onclick="updateSponsorshipStatus(${sponsorship.SponsorshipID}, true)">Mark as Sponsored</button>
            <button onclick="deleteSponsorship(${sponsorship.SponsorshipID})">Delete</button>
        `;
        list.appendChild(item);
    });
}



function showAddSponsorshipForm() {
    document.getElementById('addSponsorshipForm').style.display = 'block';
}

function addSponsorship() {
    const seferID = document.getElementById('newSponsorshipSeferID').value;
    const type = document.getElementById('newSponsorshipType').value;
    const detail = document.getElementById('newSponsorshipDetail').value;
    const amount = document.getElementById('newSponsorshipAmount').value;
    apiRequest('/api/sponsorships', {
        method: 'POST',
        body: JSON.stringify({ SeferID: seferID, Type: type, TypeDetail: detail, IsSponsored: false, PaymentStatus: 'Unpaid', Amount: amount })
    })
        .then(() => {
            fetchSponsorships();  // Refresh the list
            document.getElementById('addSponsorshipForm').style.display = 'none';
        })
        .catch(error => displayError(error, 'sponsorshipsList'));
}

function updateSponsorshipStatus(id, isSponsored) {
    apiRequest(`/api/sponsorships/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ IsSponsored: isSponsored })
    })
        .then(() => fetchSponsorships())  // Refresh the list
        .catch(error => displayError(error, 'sponsorshipsList'));
}

function deleteSponsorship(id) {
    apiRequest(`/api/sponsorships/${id}`, { method: 'DELETE' })
        .then(() => fetchSponsorships())  // Refresh the list
        .catch(error => displayError(error, 'sponsorshipsList'));
}

// Error Handling Utility
function displayError(error, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = `<p>Error: ${error.message || 'An unknown error occurred'}</p>`;
}
