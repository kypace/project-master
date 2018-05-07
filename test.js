const request = require('supertest');
const app = require('./app');

describe('Testing app.js...', () => {
	test('GET login page', () => {
		return request(app).get('/').then(response => {
			expect(response.statusCode).toBe(200)
		})
	});
	test('POST registration form', () => {
		return request(app).post('/signup').then(response => {
			expect(response.statusCode).toBe(200)
		})
	});
	test('POST login form', () => {
		return request(app).post('/login').then(response => {
			expect(response.statusCode).toBe(200)
		})
	});
	test('GET home page', () => {
		return request(app).get('/home').then(response => {
			expect(response.statusCode).toBe(200)
		})
	});
	test('GET search page', () => {
		return request(app).get('/search').then(response => {
			expect(response.statusCode).toBe(200)
		})
	});
	test('POST search page', () => {
		return request(app).post('/search').then(response => {
			expect(response.statusCode).toBe(200)
		})
	});
	test('GET favorites page', () => {
		return request(app).get('/favorites').then(response => {
			expect(response.statusCode).toBe(200)
		})
	});
	test('POST favorites page', () => {
		return request(app).post('/favorites').then(response => {
			expect(response.statusCode).toBe(200)
		})
	});
	test('GET recommendations page', () => {
		return request(app).get('/recommendations').then(response => {
			expect(response.statusCode).toBe(200)
		})
	});
	test('GET settings page', () => {
		return request(app).get('/settings').then(response => {
			expect(response.statusCode).toBe(200)
		})
	});
	test('POST settings page', () => {
		return request(app).post('/settings').then(response => {
			expect(response.statusCode).toBe(200)
		})
	});
	test('GET logout page', () => {
		return request(app).get('/logout').then(response => {
			expect(response.statusCode).toBe(200)
		})
	});
});