const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentLink(description, amount, metadata) {
    try {
        // Create a product
        const product = await stripe.products.create({
            name: description,
            metadata: metadata
        });

        // Create a price for the product
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: amount * 100, // Convert amount to cents
            currency: 'usd',
        });

        // Create the payment link using the price ID
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [{
                price: price.id, // Use the price ID
                quantity: 1,
                adjustable_quantity: {
                    enabled: false // Ensure quantity is not adjustable
                }
            }],
            after_completion: {
                type: 'redirect',
                redirect: { url: "https://projectzechusavos.org/success" }
            }
        });

        return paymentLink.url;
    } catch (error) {
        console.error('Failed to create payment link:', error);
        throw error;
    }
}

module.exports = { createPaymentLink, createCheckoutSession };



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
