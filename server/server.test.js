const request = require('supertest');
const server  = require('./server');

afterEach(function () {
    server.close();
});

test('creation of express server', (done) => {
    request(server).get('/').expect(200, done);
});