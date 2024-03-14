require('dotenv').config();


document.addEventListener('DOMContentLoaded', () => {
    fetchHighlightedMitzvot().then(renderHighlightedMitzvot);
});

async function fetchHighlightedMitzvot() {
    // Fetch a few highlighted mitzvot for initial display
    const response = await fetch('/api/highlighted-mitzvot');
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
}

function renderHighlightedMitzvot(mitzvot) {
    // Assume we have a <div id="highlighted-mitzvot"></div> for this purpose
    const container = document.getElementById('highlighted-mitzvot');
    mitzvot.forEach(mitzvah => {
        const mitzvahElement = document.createElement('div');
        mitzvahElement.innerHTML = `
            <h3>${mitzvah.name}</h3>
            <p>${mitzvah.description}</p>
        `;
        container.appendChild(mitzvahElement);
    });
}
