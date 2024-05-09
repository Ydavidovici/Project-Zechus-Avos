const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(items, successUrl, cancelUrl) {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
        });
        return session;
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw error;
    }
}

module.exports = { createCheckoutSession };
