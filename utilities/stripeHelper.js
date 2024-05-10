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
        const line_items = items.map(async item => {
            const product = await createProduct(item.description, item.metadata || {});
            const price = await createPrice(product.id, item.amount);
            return {
                price: price.id,
                quantity: item.quantity || 1,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: await Promise.all(line_items),
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

function constructEvent(requestBody, sigHeader, secret) {
    try {
        return stripe.webhooks.constructEvent(requestBody, sigHeader, secret);
    } catch (err) {
        console.error('Failed to validate webhook:', err);
        throw err;
    }
}

function handleEvent(event) {
    console.log(`Handling event type: ${event.type}`);
    switch (event.type) {
        case 'checkout.session.completed':
            handleCheckoutSessionCompleted(event.data.object);
            break;
        case 'payment_intent.succeeded':
            updatePaymentStatus(event.data.object, 'Paid');
            break;
        case 'payment_intent.payment_failed':
            updatePaymentStatus(event.data.object, 'Failed');
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }
}


function handleCheckoutSessionCompleted(session) {
    const sponsorshipId = session.metadata.sponsorshipId;
    if (sponsorshipId) {
        updateSponsorshipStatus(sponsorshipId, 'Paid');
    } else {
        console.error('No sponsorshipId provided in session metadata');
    }
}

function updatePaymentStatus(intent, status) {
    console.log(`Updating payment status for PaymentIntent ${intent.id} to ${status}`);
    db.run("UPDATE Sponsorships SET PaymentStatus = ? WHERE PaymentIntentID = ?", [status, intent.id], err => {
        if (err) {
            console.error(`Database error during payment status update: ${err.message}`);
        } else {
            console.log(`Payment status updated to ${status} for PaymentIntent ${intent.id}`);
        }
    });
}

function updateSponsorshipStatus(sponsorshipId, status) {
    db.run("UPDATE Sponsorships SET PaymentStatus = ? WHERE SponsorshipID = ?", [status, sponsorshipId], err => {
        if (err) {
            console.error(`Database error during sponsorship status update: ${err.message}`);
        } else {
            console.log(`Sponsorship status updated to ${status} for Sponsorship ID: ${sponsorshipId}`);
        }
    });
}

module.exports = {
    createCheckoutSession,
    constructEvent,
    handleEvent
};
