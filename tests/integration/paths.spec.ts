// //this import must be called before the first import of tsyring
// // import { MCLogger } from '@map-colonies/mc-logger';
// import 'reflect-metadata';
// import { Application } from 'express';
// import supertest from 'supertest';
// import { getApp } from '../../src/app';
// import { TestDB } from '../utils/db';

// let app: Application;
// const testDB = new TestDB('test');

// beforeAll(async () => {

//   try {
//     app = await getApp();
//     await testDB.initializeDatabase();
//     await testDB.initializeTestData(); // Initialize a new DB or a new schema for testing
//   } catch (e) {
//     console.error('eeee', e);
//   }

//   return;
// });

// afterAll(async () => {
//   await testDB.clearTestData(); // Remove test DB or schema
//   return;
// });

// describe('GET /api/v1/cores', function () {
//   describe('Happy Path', function () {
//     it('test 200 response', async () => {
//       const response = await supertest(app).get('/api/v1/cores');
//       // expect(response.body).toBe
//       expect(response.status).toBe(200);
//     });
//     describe('Sad Paths', function () {
//       it('test 401 response', function () {
//         // test code
//       });
//       it('test 403 response', function () {
//         // test code
//       });
//       it('test 422 response', function () {
//         // test code
//       });
//       it('test 409 response', function () {
//         // test code
//       });
//       it('test 500 response', function () {
//         // test code
//       });
//     });
//     describe('Bad Path', function () {
//       it('test 400 - BAD REQUEST response', function () {
//         // test code
//       });
//       it('test 400 - BAD REQUEST response', function () {
//         // test code
//       });
//       it('test 400 - BAD REQUEST response', function () {
//         // test code
//       });
//       it('test 400 - BAD REQUEST response', function () {
//         // test code
//       });
//     });
//   });
// });
