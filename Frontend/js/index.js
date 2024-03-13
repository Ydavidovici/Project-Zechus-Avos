// Load and display mitzvot on the homepage
function loadAndDisplayMitzvot() {
    fetch('/api/mitzvot')
        .then(response => response.json())
        .then(mitzvot => {
            const listElement = document.getElementById('mitzvot-list');
            mitzvot.forEach(mitzvah => {
                const itemElement = document.createElement('li');
                itemElement.textContent = `${mitzvah.name} - ${formatDate(mitzvah.date)}`;
                // Add more details and a button for sponsoring here
                listElement.appendChild(itemElement);
            });
        })
        .catch(error => console.error('Failed to load mitzvot:', error));
}

// Assuming you have an element with id="mitzvot-list" in your HTML
document.addEventListener('DOMContentLoaded', loadAndDisplayMitzvot);
