const { Router }            = require('express');
const { verifyToken }       = require('../middleware/authmiddleware/Jwt');
const { authorizeRoles }    = require('../middleware/rolemiddleware/role');
const {
  createRoom,
  getRoomToken,
  logStart,
  logEnd,
  getLogs
} = require('../controllers/videoController');

const router = Router();

router.use(verifyToken);

router.post(
    "/room",
    authorizeRoles('patient', 'doctor'),
    createRoom
);

router.get(
    '/token/:appointmentId',
    authorizeRoles('patient', 'doctor'),
    getRoomToken
);

router.post(
    '/logs/start',
    authorizeRoles('patient', 'doctor'),
    logStart
);

router.put(
    '/logs/end',
    authorizeRoles('patient', 'doctor'),
    logEnd
);

router.get(
    '/logs/:appointmentId',
    authorizeRoles('patient', 'doctor','admin'),
    getLogs
)

module.exports = router