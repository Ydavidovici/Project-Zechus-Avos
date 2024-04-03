// index.test.js
const request = require('supertest');
const app = require('./index');

describe('GET /api', () => {
  it('responds with a 200 status', async () => {
    const response = await request(app).get('/api');
    expect(response.statusCode).toBe(200);
  });
});
