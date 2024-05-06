document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/mitzvos')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            renderMitzvos(data.data); // Access the 'data' property containing the array
        })
        .catch(error => {
            console.error('Error fetching mitzvos:', error);
        });
});


function renderMitzvos(mitzvos) {
    const container = document.getElementById('mitzvos-list');
    if (!container) {
        console.error('Container for mitzvos list not found');
        return;
    }

    // Clear previous contents
    container.innerHTML = '';

    mitzvos.forEach(mitzvah => {
        // Create a new container for this mitzvah
        const mitzvahContainer = document.createElement('div');
        mitzvahContainer.className = 'mitzvah-container'; // for CSS styling

        // Add Mitzvah name and description
        mitzvahContainer.innerHTML = `
            <h3>${mitzvah.name}</h3>
            <p>${mitzvah.description}</p>
        `;

        // Create a "Sponsor Now" button
        const sponsorButton = document.createElement('button');
        sponsorButton.textContent = 'Sponsor Now';
        sponsorButton.className = 'sponsor-button'; // for CSS styling
        sponsorButton.onclick = function() {
            openSponsorModal(mitzvah.id, mitzvah.name, mitzvah.description);
        };

        // Append the button to the mitzvah container
        mitzvahContainer.appendChild(sponsorButton);

        // Append the mitzvah container to the main container
        container.appendChild(mitzvahContainer);
    });
}




document.getElementById('mitzvos-list').addEventListener('click', function(event) {
    if (event.target.classList.contains('mitzvah')) {
        event.target.style.color = 'red';
    }
});

function openSponsorModal(id, name, description) {
    // Get the modal element
    const modal = document.getElementById('sponsor-modal');

    if (modal === null) {
        console.error('No element with id "sponsor-modal" found');
        return;
    }

    // Populate the modal with the mitzvah details
    modal.querySelector('.mitzvah-name').textContent = name;
    modal.querySelector('.mitzvah-description').textContent = description;

    // Show the modal
    modal.style.display = 'block';
}

function setupStripe() {
    const stripe = Stripe('your_stripe_public_key');
    const elements = stripe.elements();
    const card = elements.create('card');
    card.mount('#card-element');

    card.on('change', ({error}) => {
        document.getElementById('card-errors').textContent = error ? error.message : '';
    });

    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Insert Stripe payment submission logic here
    });
}

// Define a mapping from sponsorship names to Stripe Payment Links
const paymentLinks = {
    'Book Cover Sponsorship': 'https://your-stripe-payment-link-for-book-cover',
    'Dedications Page Sponsorship': 'https://your-stripe-payment-link-for-dedications-page',
    'General Donations': 'https://your-stripe-payment-link-for-general-donations'
};

// Function to open the form and set the title
function openForm(sponsorshipName) {
    document.getElementById('sponsor-form').style.display = 'block';
    document.getElementById('form-title').innerText = sponsorshipName;
}

// Function to validate the form data and send it to the server
function submitForm() {
    // Validate the form data
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const sponsoredFor = document.getElementById('sponsoredFor').value;
    if (!name || !phone || !email || !sponsoredFor) {
        alert('Please fill out all fields in the form.');
        return;
    }

    // Send the form data to the server
    const sponsorshipName = document.getElementById('form-title').innerText;
    const formData = {
        sponsorshipName: sponsorshipName,
        name: name,
        phone: phone,
        email: email,
        sponsoredFor: sponsoredFor
    };
    fetch('/sponsor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // If the server responded with success, redirect to the Stripe Payment Link
            window.location = data.paymentLink;
        } else {
            // If the server responded with an error, display the error message
            alert(data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to open the modal and set the title and description
function openModal(sponsorshipName, mitzvahDescription) {
    document.getElementById('sponsor-modal').style.display = 'block';
    document.getElementById('form-title').innerText = sponsorshipName;
    document.getElementById('mitzvah-description').innerText = mitzvahDescription;
}

// Function to close the modal
function closeModal() {
    document.getElementById('sponsor-modal').style.display = 'none';
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == document.getElementById('sponsor-modal')) {
        closeModal();
    }
}

// When the user clicks on the 'x' span (close), close the modal
document.getElementsByClassName('close')[0].onclick = function() {
    closeModal();
}
