const jwt = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const { registerUser,
        loginStepOne,
        loginStepTwo,
        refreshAccessToken,
        logout,
        verifyEmail } = require('../controllers/authController');
const User = require('../models/User');
const EmailToken = require('../models/EmailTokens');
const {
  generateAuthTokens,
  verifyRefreshToken,
  revokeRefreshToken,
  generateSecondFactorToken,
  verifySecondFactorToken
} = require('../services/authServices');
const { responseBody }  = require('../config/responseBody');

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

function mockReq(body = {}, query = {}, userId) {
  return {
    body,
    query,
    headers: {},
    userId
  };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

jest.mock('../models/User');
jest.mock('../models/EmailTokens');
jest.mock('../services/authServices');

User.mockImplementation(function (data) {
  Object.assign(this, data);
  this._id = 'u1';
  this.save = jest.fn().mockResolvedValue(this);
});

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const fakeSend = jest.fn();
    const handler  = registerUser(fakeSend);

    it('returns 400 if required fields are missing', async () => {
      const req = mockReq({ email: 'a@b.com' });
      const res = mockRes();
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400,
          expect.stringContaining('Validation error'),
          null
        )
      );
    });

    it('returns 409 if email already exists', async () => {
      User.findOne.mockResolvedValue({ _id: 'existing' });
      const req = mockReq({
        fullName: 'Foo',
        email: 'a@b.com',
        password: 'p',
        role: 'r',
        securityQuestion: 'q',
        securityAnswer: 'a'
      });
      const res = mockRes();
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(409, 'Email already registered', null)
      );
    });

    it('saves user, calls sendVerificationCode and returns 201', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue('hashedA');

      const req = mockReq({
        fullName: 'Foo',
        email: 'a@b.com',
        password: 'p',
        role: 'r',
        securityQuestion: 'q',
        securityAnswer: 'a'
      });
      const res = mockRes();

      await handler(req, res);

      expect(fakeSend).toHaveBeenCalledWith(expect.objectContaining({
        email: 'a@b.com'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(201,
          'User registered successfully; verification email sent',
          expect.objectContaining({
            ID:       'u1',
            fullName: 'Foo',
            email:    'a@b.com',
            role:     'r'
          })
        )
      );
    });
  });

  describe('loginStepOne', () => {
    it('401 if no user', async () => {
      User.findOne.mockResolvedValue(null);
      const req = mockReq({ email: 'a', password: 'p' });
      const res = mockRes();
      await loginStepOne(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('403 if not verified', async () => {
      User.findOne.mockResolvedValue({ password: 'pw', emailVerified: false });
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      const req = mockReq({ email: 'a', password: 'p' });
      const res = mockRes();
      await loginStepOne(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('returns question and tempToken on success', async () => {
      const user = {
        _id: 'u1',
        password: 'pw',
        emailVerified: true,
        securityQuestion: 'sq'
      };
      User.findOne.mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      generateSecondFactorToken.mockReturnValue('temp.jwt');

      const req = mockReq({ email: 'a', password: 'p' });
      const res = mockRes();
      await loginStepOne(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200,
          expect.any(String),
          { question: 'sq', tempToken: 'temp.jwt' }
        )
      );
    });
  });

  describe('loginStepTwo', () => {
    it('404 if user not found', async () => {
      const req = mockReq({ securityAnswer: 'ans' });
      req.userId = 'u1';
      User.findById = jest.fn().mockResolvedValue(null);
      const res = mockRes();
      await loginStepTwo(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('401 if wrong answer', async () => {
      const user = { securityAnswer: 'hash' };
      const req = mockReq({ securityAnswer: 'ans' });
      req.userId = 'u1';
      User.findById = jest.fn().mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(false);
      const res = mockRes();
      await loginStepTwo(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('200 and tokens on success', async () => {
      const user = {
        _id: 'u1',
        fullName: 'F',
        email: 'e',
        role: 'r',
        securityAnswer: 'hash'
      };
      const req = mockReq({ securityAnswer: 'ans' });
      req.userId = 'u1';
      User.findById = jest.fn().mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      generateAuthTokens.mockResolvedValue({
        accessToken: 'a',
        refreshToken: 'r',
        expiresIn: '1h'
      });

      const res = mockRes();
      await loginStepTwo(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200,
          'Login successful',
          expect.objectContaining({ accessToken: 'a', refreshToken: 'r' })
        )
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('400 if missing refreshToken', async () => {
      const res = mockRes();
      await refreshAccessToken(mockReq({}), res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('401 if verifyRefreshToken throws', async () => {
      verifyRefreshToken.mockRejectedValue(new Error('bad'));
      const res = mockRes();
      await refreshAccessToken(mockReq({ refreshToken: 't' }), res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('200 and new tokens on success', async () => {
      verifyRefreshToken.mockResolvedValue({ userId: 'u1' });
      revokeRefreshToken.mockResolvedValue();
      User.findById = jest.fn().mockResolvedValue({ _id: 'u1', email: 'e', role: 'r' });
      generateAuthTokens.mockResolvedValue({ accessToken: 'a', refreshToken: 'r', expiresIn: '1h' });

      const res = mockRes();
      await refreshAccessToken(mockReq({ refreshToken: 't' }), res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200,
          'Token refreshed',
          expect.objectContaining({ accessToken: 'a', refreshToken: 'r' })
        )
      );
    });
  });

  describe('logout', () => {
    it('200 even if no token', async () => {
      const res = mockRes();
      await logout(mockReq({}), res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('revokes token if provided', async () => {
      revokeRefreshToken.mockResolvedValue();
      const res = mockRes();
      await logout(mockReq({ refreshToken: 't' }), res);
      expect(revokeRefreshToken).toHaveBeenCalledWith('t');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('verifyEmail', () => {
    it('400 if no token', async () => {
      const res = mockRes();
      await verifyEmail(mockReq({}, {}), res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('401 if invalid token record', async () => {
      EmailToken.findOne.mockResolvedValue(null);
      const res = mockRes();
      await verifyEmail(mockReq({}, { token: 't' }), res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('404 if user not found', async () => {
      EmailToken.findOne.mockResolvedValue({ userId: 'u1', verified: false });
      User.findById = jest.fn().mockResolvedValue(null);
      const res = mockRes();
      await verifyEmail(mockReq({}, { token: 't' }), res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('200 on success', async () => {
      const tokenDoc = { userId: 'u1', verified: false, save: jest.fn() };
      EmailToken.findOne.mockResolvedValue(tokenDoc);
      const user = { _id: 'u1', emailVerified: false, save: jest.fn() };
      User.findById = jest.fn().mockResolvedValue(user);

      const res = mockRes();
      await verifyEmail(mockReq({}, { token: 't' }), res);

      expect(user.emailVerified).toBe(true);
      expect(tokenDoc.verified).toBe(true);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
