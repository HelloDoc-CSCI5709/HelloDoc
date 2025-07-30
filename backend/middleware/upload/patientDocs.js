const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads/patient');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];

const createStorage = (docType) => multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const userId = req.user?.userId || 'unknown';
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${userId}_${docType}${ext}`;
      cb(null, filename);
    }
  }),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      const error = new Error('Invalid file type');
      error.code = 'INVALID_FILE_TYPE';
      return cb(error);
    }
    cb(null, true);
  },
  limits: {
    files: 1
  }
});

module.exports = {
  uploadHealthCardFront: createStorage('healthcard-front'),
  uploadHealthCardBack:  createStorage('healthcard-back'),
  uploadInsurance:       createStorage('insurance'),
  uploadAllergy:         createStorage('allergy'),
  uploadMedical:         createStorage('medical-history')
};
