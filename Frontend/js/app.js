document.addEventListener('DOMContentLoaded', function() {
    // Example function to add Mitzvot to the page
    function loadMitzvot() {
        const mitzvahList = document.getElementById('mitzvah-list');
        // Example list of Mitzvot, in reality, this would come from the server
        const mitzvot = [
            { name: "Mitzvah 1", price: 180 },
            { name: "Mitzvah 2", price: 180 },
            // Add more Mitzvot here
        ];

        mitzvot.forEach(mitzvah => {
            const div = document.createElement('div');
            div.className = 'mitzvah';
            div.textContent = `${mitzvah.name} - $${mitzvah.price}`;
            div.addEventListener('click', () => sponsorMitzvah(mitzvah));
            mitzvahList.appendChild(div);
        });
    }

    function sponsorMitzvah(mitzvah) {
        console.log(`Sponsoring ${mitzvah.name}`);
        // Here, you would trigger the Stripe Checkout flow
        // This requires server-side interaction to create a Checkout Session
    }

    loadMitzvot();
});
