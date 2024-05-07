// // main script for handling interactions and database calls for the siach eliezer page

document.addEventListener('DOMContentLoaded', function() {
    fetchNonSponsoredParshahs();
});

function fetchNonSponsoredParshahs() {
    fetch('/api/sponsorships?seferId=2&type=Parshah&isSponsored=false')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => displayParshahs(data.data))
        .catch(error => console.error('Error fetching non-sponsored Parshahs:', error));
}

function displayParshahs(parshahs) {
    const container = document.getElementById('parshahList');
    container.innerHTML = ''; // Clear previous entries

    if (parshahs.length === 0) {
        container.innerHTML = '<p>No non-sponsored Parshahs available.</p>';
    } else {
        parshahs.forEach(parshah => {
            const parshahElement = document.createElement('li');
            parshahElement.textContent = `${parshah.TypeDetail}`;
            container.appendChild(parshahElement);
        });
    }
}
