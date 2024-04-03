// FILEPATH: /Users/yaakovdavidovici/Coding/Websites/Project_Zechus_Avos/Backend/tests/sponsorships.test.js

const request = require('supertest');
const express = require('express');
const sponsorshipsRoutes = require('../src/routes/sponsorships');
const app = express();
app.use(express.json());
app.use('/', sponsorshipsRoutes);

describe('Sponsorships API', () => {
    it('should fetch all unsponsored mitzvot in ascending order by ID', async () => {
        const res = await request(app).get('/mitzvot');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'success');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should sponsor a mitzvah by id', async () => {
        const testId = 1; // replace with a valid id
        const res = await request(app).post(`/sponsor/${testId}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Mitzvah sponsorship updated successfully');
        expect(res.body).toHaveProperty('mitzvahId', testId.toString());
    });
});
