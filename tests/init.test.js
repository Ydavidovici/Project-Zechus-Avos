const { JSDOM } = require('jsdom');
const { window } = new JSDOM('<!doctype html><html><body><div id="highlighted-mitzvot"></div></body></html>');
global.document = window.document;
global.fetch = require('jest-fetch-mock');

const { fetchHighlightedMitzvot, renderHighlightedMitzvot } = require('/Users/yaakovdavidovici/Coding/Websites/Project_Zechus_Avos/Frontend/js/init.js');

describe('fetchHighlightedMitzvot', () => {
    beforeEach(() => {
        fetch.resetMocks();
    });

    it('fetches data from server when server returns a successful response', async () => {
        fetch.mockResponseOnce(JSON.stringify([{ name: 'mitzvah1', description: 'description1' }]));
        const res = await fetchHighlightedMitzvot();
        expect(res).toEqual([{ name: 'mitzvah1', description: 'description1' }]);
        expect(fetch).toHaveBeenCalledWith('/api/highlighted-mitzvot');
    });

    it('throws an error when server returns an error', async () => {
        fetch.mockReject(new Error('fake error message'));
        await expect(fetchHighlightedMitzvot()).rejects.toThrow('fake error message');
    });
});

describe('renderHighlightedMitzvot', () => {
    it('renders mitzvot correctly', () => {
        const mitzvot = [
            { name: 'mitzvah1', description: 'description1' },
            { name: 'mitzvah2', description: 'description2' },
        ];
        renderHighlightedMitzvot(mitzvot);
        const container = document.getElementById('highlighted-mitzvot');
        expect(container.children.length).toBe(2);
        expect(container.children[0].innerHTML).toContain('<h3>mitzvah1</h3>');
        expect(container.children[0].innerHTML).toContain('<p>description1</p>');
        expect(container.children[1].innerHTML).toContain('<h3>mitzvah2</h3>');
        expect(container.children[1].innerHTML).toContain('<p>description2</p>');
    });
});
