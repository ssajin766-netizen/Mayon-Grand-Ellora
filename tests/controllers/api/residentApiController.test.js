// tests/controllers/api/residentApiController.test.js
// API integration tests for POST /api/residents

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const residentRouter = require('../../../routes/api/residentApi');
const Resident = require('../../../models/residentModel');

// Mock auth middleware to bypass authentication and set a test user
jest.mock('../../../middleware/auth', () => ({
  isLoggedIn: (req, res, next) => {
    req.user = { _id: 'user123', societyName: 'TestSociety', isApproved: true, isAdmin: false };
    next();
  },
  isApproved: (req, res, next) => next(),
  isAdmin: (req, res, next) => next(),
}));

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  app = express();
  app.use(express.json());
  app.use('/api', residentRouter);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Resident.deleteMany({});
});

describe('POST /api/residents', () => {
  const validPayload = {
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    category: 'Owner',
    unitNumber: 'A1',
  };

  test('creates resident successfully (201)', async () => {
    const res = await request(app).post('/api/residents').send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Resident created successfully.');
    expect(res.body.data).toMatchObject({ firstName: 'John', phone: '1234567890' });
  });

  test('missing required field returns 400', async () => {
    const payload = { firstName: 'John' };
    const res = await request(app).post('/api/residents').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });

  test('invalid category returns 400', async () => {
    const payload = { ...validPayload, category: 'InvalidCat' };
    const res = await request(app).post('/api/residents').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('INVALID_CATEGORY');
  });

  test('duplicate phone within same society returns 409', async () => {
    await Resident.create({ ...validPayload, societyName: 'TestSociety' });
    const res = await request(app).post('/api/residents').send(validPayload);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('PHONE_EXISTS');
  });

  test('duplicate unit within same society returns 409', async () => {
    await Resident.create({ ...validPayload, societyName: 'TestSociety' });
    const payload = { ...validPayload, phone: '9999999999' };
    const res = await request(app).post('/api/residents').send(payload);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('UNIT_EXISTS');
  });

  test('same phone in different society creates new resident (201)', async () => {
    await Resident.create({ ...validPayload, societyName: 'OtherSociety' });
    const res = await request(app).post('/api/residents').send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.societyName).toBe('TestSociety');
  });

  test('same unit in different society creates new resident (201)', async () => {
    await Resident.create({ ...validPayload, societyName: 'OtherSociety' });
    const payload = { ...validPayload, phone: '9999999999' };
    const res = await request(app).post('/api/residents').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.societyName).toBe('TestSociety');
  });

  test('unexpected database error returns 500', async () => {
    jest.spyOn(Resident.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('DB failure');
    });
    const res = await request(app).post('/api/residents').send(validPayload);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    Resident.prototype.save.mockRestore();
  });
});
