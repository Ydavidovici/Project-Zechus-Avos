// public/js/checkout.js
document.getElementById('checkout-button').addEventListener('click', function() {
    fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            items: [{ price: 'price_ID', quantity: 1 }],
            successUrl: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
            cancelUrl: 'http://localhost:3000/cancel'
        })
    })
        .then(function(response) {
            return response.json();
        })
        .then(function(session) {
            var stripe = Stripe('pk_test_your_public_key');
            stripe.redirectToCheckout({ sessionId: session.sessionId });
        })
        .catch(function(error) {
            console.error('Error:', error);
        });
});
