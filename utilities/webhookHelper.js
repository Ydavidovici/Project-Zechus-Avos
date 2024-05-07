// utilities/webhookHelper.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

function constructEvent(requestBody, sigHeader, secret) {
    try {
        return stripe.webhooks.constructEvent(requestBody, sigHeader, secret);
    } catch (err) {
        console.error('Failed to validate webhook:', err);
        throw err;  // Rethrow to be handled by the caller
    }
}

function handleEvent(event) {
    switch (event.type) {
        case 'checkout.session.completed':
            console.log('Checkout session completed');
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
}

module.exports = { constructEvent, handleEvent };
