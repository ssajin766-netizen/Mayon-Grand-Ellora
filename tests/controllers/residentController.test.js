// tests/controllers/residentController.test.js
// Unit tests for the web Resident controller (createResident)

const { createResident } = require('../../controllers/residentController');

jest.mock('../../helpers/residentService', () => ({
  createResidentService: jest.fn(),
}));

const { createResidentService } = require('../../helpers/residentService');

describe('Resident Web Controller - createResident', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { societyName: 'TestSociety' },
      body: {},
      flash: jest.fn().mockReturnThis(),
    };
    res = {
      redirect: jest.fn().mockReturnThis(),
    };
  });

  test('successful creation redirects to /residents with success flash', async () => {
    const serviceResult = { success: true, status: 201, message: 'Resident created successfully.' };
    createResidentService.mockResolvedValueOnce(serviceResult);
    await createResident(req, res);
    expect(req.flash).toHaveBeenCalledWith('success', serviceResult.message);
    expect(res.redirect).toHaveBeenCalledWith('/residents');
  });

  test('validation failure redirects back with error flash', async () => {
    const serviceResult = { success: false, status: 400, message: 'Missing required fields', errorCode: 'VALIDATION_ERROR' };
    createResidentService.mockResolvedValueOnce(serviceResult);
    await createResident(req, res);
    expect(req.flash).toHaveBeenCalledWith('error', serviceResult.message);
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  test('duplicate phone error redirects back with specific error flash', async () => {
    const serviceResult = { success: false, status: 409, message: 'Phone number already exists in this society.', errorCode: 'PHONE_EXISTS' };
    createResidentService.mockResolvedValueOnce(serviceResult);
    await createResident(req, res);
    expect(req.flash).toHaveBeenCalledWith('error', serviceResult.message);
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  test('duplicate unit error redirects back with specific error flash', async () => {
    const serviceResult = { success: false, status: 409, message: 'Unit number already exists in this society.', errorCode: 'UNIT_EXISTS' };
    createResidentService.mockResolvedValueOnce(serviceResult);
    await createResident(req, res);
    expect(req.flash).toHaveBeenCalledWith('error', serviceResult.message);
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  test('unexpected exception results in generic error flash and redirect back', async () => {
    createResidentService.mockImplementationOnce(() => {
      throw new Error('DB failure');
    });
    await createResident(req, res);
    expect(req.flash).toHaveBeenCalledWith('error', 'Unable to create resident.');
    expect(res.redirect).toHaveBeenCalledWith('back');
  });
});
