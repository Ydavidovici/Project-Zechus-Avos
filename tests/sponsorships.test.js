// sponsorships.test.js

/**
 * @jest-environment jsdom
 */

// At the top of your test file (sponsorships.test.js)
jest.mock('node-fetch', () => ({
    __esModule: true, // this property makes it work as a module
    default: jest.fn() // this is your mock fetch function
}));
const fetch = require('node-fetch');
global.fetch = fetch;

document.body.innerHTML = `
  <div id="sponsorshipsList"></div>
  <input type="text" id="sponsorName" value="John Doe"/>
  <input type="text" id="sponsorContact" value="1234567890"/>
  <input type="text" id="forWhom" value="For the community"/>
  <button id="fetchSponsorships">Fetch Sponsorships</button>
  <button id="initiateCheckoutButton">Checkout</button>
`;

// Assuming these functions are exported from your actual JS files
const { fetchAvailableSponsorships, displaySponsorships, initiateCheckout } = require('../public/js/sponsorships');

jest.mock('../public/js/sponsorships', () => ({
    fetchAvailableSponsorships: jest.fn(),
    displaySponsorships: jest.fn(),
    initiateCheckout: jest.fn(),
}));

describe('Sponsorship Frontend Tests', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        fetch.mockClear();
        fetchAvailableSponsorships.mockClear();
        displaySponsorships.mockClear();
        initiateCheckout.mockClear();
    });

    it('should fetch and display sponsorships when "Fetch Sponsorships" button is clicked', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ data: [{ SponsorshipID: 1, TypeDetail: 'Gold', Amount: 10000 }] })
        });

        const fetchButton = document.getElementById('fetchSponsorships');
        fetchButton.dispatchEvent(new MouseEvent('click'));

        // You need to await async functions to ensure that the state changes are applied
        await new Promise(process.nextTick);  // This simulates the event loop tick
        expect(fetchAvailableSponsorships).toHaveBeenCalled();
        expect(displaySponsorships).toHaveBeenCalledWith([{ SponsorshipID: 1, TypeDetail: 'Gold', Amount: 10000 }]);
    });


    it('should initiate checkout when checkout button is clicked', () => {
        const checkoutButton = document.getElementById('initiateCheckoutButton');
        checkoutButton.dispatchEvent(new MouseEvent('click'));

        expect(initiateCheckout).toHaveBeenCalled();
    });
});

