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
                    unit_amount: amount * 100, // amount is expected to be in cents
                },
                quantity: 1
            }],
            after_completion: {
                type: 'redirect',
                redirect: { url: "https://projectzechusavos/success" }
            }
        });
        return paymentLink;
    } catch (error) {
        console.error('Error creating payment link:', error);
        throw error;
    }
}


module.exports = { createPaymentLink };
