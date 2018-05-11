const request = require('supertest');
const app = require('./app');
//const auth = require('./auth');
var mdb = require("./themoviedb");
/*
describe('Testing auth.js...', () =>{
	test('Load user file', (done)=>{
		expect(auth.load).toBeDefined()

	})
});
*/

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





describe("Testing themoviedb.js...", ()=>{

	//Search Testing
	test("search 'In the Loop' pt1 (correct results returned)", (done)=>{
		mdb.search("in the loop").then((result)=>{
			expect(result[0].title).toBe("In the Loop") 
		})
		done();
	})
	test("search 'In the Loop' pt2 (only correct results returned)", (done)=>{
		mdb.search("in the loop").then((result)=>{
			expect(result.length).toBe(1)
		})
		done();
	})
	
	test("search with no results", (done)=>{
		mdb.search("dgadrfhsgfjdgkhdg").then((result)=>{
			expect(result.length).toBe(0)
		})
		done();
	})


	//ParseResults Testing
	test("Test parseResults", (done)=>{
		mdb.search("in the loop").then((result)=>{
			expect(mdb.parseResults(result)).toBe("<div style='background-color:#FFFCF8; width:100%; height:20%; text-align:left; border-top:1px solid black; '><img src='http://image.tmdb.org/t/p/w92//dEGvGCf8JfbTn3FaARr09Y0qUNO.jpg' style='left=1vw; margin:5px; height:90%; vertical-align: top; display: inline; float: left'/><div style='width:100%; height:10%; vertical-align: top; display: inline'><strong>Title</strong>: In the Loop<br><strong>Overview</strong>: The US President and the UK Prime Minister are looking to launch a war in the Middle East. The plot follows government officials and advisers in their behind-the-scenes efforts either to promote the war or prevent it. Spinal Tap meets Strangelove. A satirical demolition of Whitehall and Washington: politically astute, hilarious and terrifyingly real.<br><strong>Release Date</strong>: 2009-01-22<br><form action=\"/favorites\" enctype=\"application/json\" method=\"post\"><input id= \"favIndex\" name=\"favIndex\" type=\"hidden\" value=0 /><input id= \"favPush\" name=\"favPush\" type=\"hidden\" value=\"yes\" /><input id=\"Favorite\" action=\"/favorites\" type=\"submit\" value=\"Favorite\" /></form></div></div>"	
			) 
		})
		done();
	})

	//GenerateFavorites Testing
	test("Test generateFavorites with no favorites", (done)=>{
		expect(mdb.generateFavorites([])).toBe('<h2>No favorites have been saved!</h2>')
		done();
	})

	test("Test generateFavorites with favorites", (done)=>{
		mdb.search("In the loop").then((result)=>{
			expect(mdb.generateFavorites(result)).toBe("<div style='background-color:#FFFCF8; width:100%; height:20%; text-align:left; border-top:1px solid black; '><img src='http://image.tmdb.org/t/p/w92//dEGvGCf8JfbTn3FaARr09Y0qUNO.jpg' style='left=1vw; margin:5px; height:90%; vertical-align: top; display: inline; float: left'/><div style='width:100%; height:10%; vertical-align: top; display: inline'><strong>Title</strong>: In the Loop<br><strong>Overview</strong>: The US President and the UK Prime Minister are looking to launch a war in the Middle East. The plot follows government officials and advisers in their behind-the-scenes efforts either to promote the war or prevent it. Spinal Tap meets Strangelove. A satirical demolition of Whitehall and Washington: politically astute, hilarious and terrifyingly real.<br><strong>Release Date</strong>: 2009-01-22<br><form action=\"/favorites\" enctype=\"application/json\" method=\"post\"><input id= \"favIndex\" name=\"favIndex\" type=\"hidden\" value=0 /><input id= \"favPush\" name=\"favPush\" type=\"hidden\" value=\"no\" /><input id=\"Unfavorite\" action=\"/favorites\" type=\"submit\" value=\"Unfavorite\" /></form></div></div>")
		})
		done();
	})


})