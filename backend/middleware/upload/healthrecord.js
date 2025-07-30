const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads/health-records');
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

// Export 5 upload instances, one for each document type
module.exports = {
  uploadXRay: createStorage('xray'),
  uploadLabReport: createStorage('lab-report'),
  uploadPrescription: createStorage('prescription'),
  uploadVaccine: createStorage('vaccine'),
  uploadSurgicalNote: createStorage('surgical-note')
};
