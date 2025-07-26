const jwt = require('jsonwebtoken');
const { verifySecondFactorToken } = require('../../services/authServices');
const { responseBody }           = require('../../config/responseBody');
const { SECRET_KEY } = require('../../config/Constants');


const verifyToken = (req, res, next) => {
  if (!SECRET_KEY) {
    return res.status(500).json({ message: 'Server configuration error: JWT secret key not set' });
  }
  
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(
      responseBody(401, 'Unauthorized: Missing or invalid authorization header', null)
    );
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json(
      responseBody(403, 'Forbidden: Invalid or expired token', null)
    );
  }
};



const verifyPendingToken = (req, res, next) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json(responseBody(401, 'Missing second-factor token', null));
  }
  try {
    const userId = verifySecondFactorToken(auth.slice(7));
    req.userId = userId;
    console.log('Second-factor token verified for user:', userId);
    next();
  } catch (err) {
    return res.status(401).json(responseBody(401, err.message, null));
  }
};


module.exports = {
  verifyToken,
  verifyPendingToken
};