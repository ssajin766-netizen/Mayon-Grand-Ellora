// tests/helpers/residentService.test.js
// Service layer tests for resident creation using in‑memory MongoDB

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Resident = require('../../models/residentModel');
const { createResidentService, ERROR_CODES } = require('../../helpers/residentService');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Resident.deleteMany({});
});

const mockUser = { societyName: 'TestSociety' };

describe('createResidentService', () => {
  test('creates resident successfully', async () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      category: 'Owner',
      unitNumber: 'A1',
    };
    const result = await createResidentService(mockUser, payload);
    expect(result.success).toBe(true);
    expect(result.status).toBe(201);
    expect(result.resident).toBeDefined();
    expect(result.resident.firstName).toBe('John');
  });

  test('fails when required fields missing', async () => {
    const payload = { firstName: 'John' };
    const result = await createResidentService(mockUser, payload);
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.errorCode).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(result.errors).toHaveProperty('lastName');
    expect(result.errors).toHaveProperty('phone');
  });

  test('fails with invalid category', async () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      category: 'InvalidCat',
      unitNumber: 'A1',
    };
    const result = await createResidentService(mockUser, payload);
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.errorCode).toBe(ERROR_CODES.INVALID_CATEGORY);
  });

  test('detects duplicate phone within same society', async () => {
    await Resident.create({
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '1112223333',
      category: 'Owner',
      unitNumber: 'B2',
      societyName: mockUser.societyName,
    });
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '1112223333',
      category: 'Owner',
      unitNumber: 'C3',
    };
    const result = await createResidentService(mockUser, payload);
    expect(result.success).toBe(false);
    expect(result.status).toBe(409);
    expect(result.errorCode).toBe(ERROR_CODES.PHONE_EXISTS);
  });

  test('detects duplicate unit within same society', async () => {
    await Resident.create({
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '9998887777',
      category: 'Owner',
      unitNumber: 'B2',
      societyName: mockUser.societyName,
    });
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '1112223333',
      category: 'Owner',
      unitNumber: 'B2',
    };
    const result = await createResidentService(mockUser, payload);
    expect(result.success).toBe(false);
    expect(result.status).toBe(409);
    expect(result.errorCode).toBe(ERROR_CODES.UNIT_EXISTS);
  });

  test('allows same phone in different society', async () => {
    await Resident.create({
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '1234567890',
      category: 'Owner',
      unitNumber: 'A1',
      societyName: 'OtherSociety',
    });
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      category: 'Owner',
      unitNumber: 'B2',
    };
    const result = await createResidentService(mockUser, payload);
    expect(result.success).toBe(true);
    expect(result.status).toBe(201);
  });

  test('optional emergency contact fields do not break creation', async () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '5555555555',
      category: 'Owner',
      unitNumber: 'A1',
      emergencyContactName: '',
      emergencyContactPhone: ''
    };
    const result = await createResidentService(mockUser, payload);
    expect(result.success).toBe(true);
    expect(result.resident.emergencyContactName).toBeUndefined();
  });

  test('handles unexpected database error', async () => {
    jest.spyOn(Resident.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('DB failure');
    });
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '5555555555',
      category: 'Owner',
      unitNumber: 'A1',
    };
    const result = await createResidentService(mockUser, payload);
    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.errorCode).toBe(ERROR_CODES.UNKNOWN_ERROR);
    Resident.prototype.save.mockRestore();
  });
});
