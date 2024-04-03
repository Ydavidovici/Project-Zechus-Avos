const process = require('process');
const server = require('/Users/yaakovdavidovici/Coding/Websites/Project_Zechus_Avos/Backend/src/db/server.js');

describe('Server Port Configuration', () => {
  test('should use environment variable for PORT if set', () => {
    process.env.PORT = 3000;
    expect(server.PORT).toBe(3000);
  });

  test('should default to 3100 if environment variable for PORT is not set', () => {
    delete process.env.PORT;
    expect(server.PORT).toBe(3100);
  });
});
