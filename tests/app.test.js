// Import the necessary modules
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Mock the document object
global.document = new JSDOM('<!doctype html><html><body><div id="mitzvot-list"></div></body></html>').window.document;

// Import the function to test
const { renderMitzvot } = require('./app.js');

describe('renderMitzvot', () => {
    it('should render mitzvot correctly', () => {
        const mitzvot = [
            { id: 1, name: 'Mitzvah 1', description: 'Description 1' },
            { id: 2, name: 'Mitzvah 2', description: 'Description 2' },
        ];

        renderMitzvot(mitzvot);

        const listElement = document.getElementById('mitzvot-list');
        expect(listElement.children.length).toBe(2);

        const firstItem = listElement.children[0];
        expect(firstItem.className).toBe('mitzvah-item');
        expect(firstItem.querySelector('h2').textContent).toBe('Mitzvah 1');
        expect(firstItem.querySelector('p').textContent).toBe('Description 1');
        expect(firstItem.querySelector('button').getAttribute('data-mitzvah-id')).toBe('1');
        expect(firstItem.querySelector('button').getAttribute('data-mitzvah-name')).toBe('Mitzvah 1');
    });
});
