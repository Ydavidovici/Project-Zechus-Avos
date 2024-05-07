document.addEventListener('DOMContentLoaded', function() {
    // Event listeners for form submissions and button clicks
    document.getElementById('addSeferForm').addEventListener('submit', addSefer);
    document.getElementById('addSponsorshipForm').addEventListener('submit', addSponsorship);
    loadSeforim();
    loadSponsorships();
});

function loadSeforim() {
    fetch('/api/seforim')
        .then(response => response.json())
        .then(data => displaySeforim(data.data))
        .catch(error => console.error('Error loading Seforim:', error));
}

function displaySeforim(seforim) {
    const container = document.getElementById('seforimList');
    container.innerHTML = ''; // Clear previous entries
    seforim.forEach(sefer => {
        container.innerHTML += `<li>${sefer.SeferName} - <button onclick="deleteSefer(${sefer.SeferID})">Delete</button></li>`;
    });
}

function addSefer(event) {
    event.preventDefault();
    const seferName = document.getElementById('seferName').value;
    fetch('/api/seforim', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ SeferName: seferName })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Sefer added:', data);
            loadSeforim(); // Reload the list
        })
        .catch(error => console.error('Error adding Sefer:', error));
}

function deleteSefer(seferId) {
    fetch(`/api/seforim/${seferId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            console.log('Sefer deleted:', data);
            loadSeforim(); // Reload the list
        })
        .catch(error => console.error('Error deleting Sefer:', error));
}

function loadSponsorships() {
    fetch('/api/sponsorships')
        .then(response => response.json())
        .then(data => displaySponsorships(data.data))
        .catch(error => console.error('Error loading Sponsorships:', error));
}

function displaySponsorships(sponsorships) {
    const container = document.getElementById('sponsorshipsList');
    container.innerHTML = ''; // Clear previous entries
    sponsorships.forEach(sponsorship => {
        container.innerHTML += `<li>${sponsorship.TypeDetail} - Sponsored: ${sponsorship.IsSponsored ? 'Yes' : 'No'} - <button onclick="deleteSponsorship(${sponsorship.SponsorshipID})">Delete</button></li>`;
    });
}

function addSponsorship(event) {
    event.preventDefault();
    const formData = new FormData(document.getElementById('addSponsorshipForm'));
    const data = Object.fromEntries(formData.entries());
    fetch('/api/sponsorships', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Sponsorship added:', data);
            loadSponsorships(); // Reload the list
        })
        .catch(error => console.error('Error adding Sponsorship:', error));
}

function deleteSponsorship(sponsorshipId) {
    fetch(`/api/sponsorships/${sponsorshipId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            console.log('Sponsorship deleted:', data);
            loadSponsorships(); // Reload the list
        })
        .catch(error => console.error('Error deleting Sponsorship:', error));
}
