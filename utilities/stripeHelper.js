const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createProduct(name, metadata) {
    return await stripe.products.create({
        name: name,
        metadata: metadata
    });
}

async function createPrice(productID, amount, currency = 'usd') {
    return await stripe.prices.create({
        product: productID,
        unit_amount: amount * 100, // Convert amount to cents
        currency: currency,
    });
}

async function createCheckoutSession(items, successUrl, cancelUrl) {
    try {
        // Create products and prices dynamically from items
        const line_items = [];
        for (const item of items) {
            const product = await createProduct(item.description, item.metadata || {});
            const price = await createPrice(product.id, item.amount);
            line_items.push({
                price: price.id,
                quantity: item.quantity || 1,
            });
        }

        // Create the checkout session with newly created prices
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
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
