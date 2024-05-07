// main script for handling interactions and database calls for the mekor habracha page

document.addEventListener('DOMContentLoaded', function() {
    fetchNonSponsoredMitzvahs();
});

function fetchNonSponsoredMitzvahs() {
    fetch('/api/sponsorships?seferId=1&type=Mitzvah&isSponsored=false')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => displayMitzvahs(data.data))
        .catch(error => console.error('Error fetching non-sponsored Mitzvahs:', error));
}

function displayMitzvahs(mitzvahs) {
    const container = document.getElementById('mitzvahList');
    container.innerHTML = ''; // Clear previous entries

    if (mitzvahs.length === 0) {
        container.innerHTML = '<p>No non-sponsored Mitzvahs available.</p>';
    } else {
        mitzvahs.forEach(mitzvah => {
            const mitzvahElement = document.createElement('li');
            mitzvahElement.textContent = `${mitzvah.TypeDetail}`;
            container.appendChild(mitzvahElement);
        });
    }
}
