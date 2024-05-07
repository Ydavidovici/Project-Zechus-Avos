// utilities/stripeHelper.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentLink(description, amount, metadata) {
    try {
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: description,
                        metadata: metadata
                    },
                    unit_amount: amount * 100,  // Ensure amount is in cents
                },
                quantity: 1,
            }],
            payment_intent_data: {
                metadata: metadata
            },
            after_completion: {
                type: 'redirect',
                redirect: { url: "https://yourwebsite.com/post-payment" }
            }
        });
        return paymentLink.url;
    } catch (error) {
        console.error('Error creating payment link:', error);
        throw error;  // Ensure errors are thrown to be handled by the caller
    }
}

module.exports = { createPaymentLink };
