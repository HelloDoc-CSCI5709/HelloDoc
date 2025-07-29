const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads/doctor-credentials');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const credentialDir = path.join(__dirname, '../../uploads/doctor-credentials');
if (!fs.existsSync(credentialDir)) {
  fs.mkdirSync(credentialDir, { recursive: true });
}

const profileDir = path.join(__dirname, '../../uploads/doctor-profiles');
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

const icsDir = path.join(__dirname, '../../uploads/doctor-calendars');
if (!fs.existsSync(icsDir)) {
  fs.mkdirSync(icsDir, { recursive: true });
}

const allowedTypes = {
  credential: ['.pdf'],
  profile: ['.jpg', '.jpeg', '.png'],
  ics: ['.ics'] 
};

const createStorage = (docType) => multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let targetDir;
      if (docType === 'profile') {
        targetDir = profileDir;
      } else if (docType === 'ics') {
        targetDir = icsDir; 
      } else {
        targetDir = credentialDir;
      }
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const doctorId = req.user?.userId || 'unknown';
      const timestamp = Date.now(); 
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${doctorId}_${docType}_${timestamp}${ext}`;
      cb(null, filename);
    }
  }),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    let validTypes;
    if (docType === 'profile') {
      validTypes = allowedTypes.profile;
    } else if (docType === 'ics') {
      validTypes = allowedTypes.ics; 
    } else {
      validTypes = allowedTypes.credential;
    }
    
    if (!validTypes.includes(ext)) {
      const error = new Error(`Invalid file type for ${docType}. Only ${validTypes.join(', ')} allowed`);
      error.code = 'INVALID_FILE_TYPE';
      return cb(error);
    }
    
    if (docType === 'ics') {
      const allowedMimeTypes = [
        'text/calendar',
        'application/ics',
        'text/plain',
        'application/octet-stream'
      ];
      
      if (!allowedMimeTypes.includes(file.mimetype)) {
        const error = new Error('Invalid MIME type for ICS file. Please upload a valid calendar file.');
        error.code = 'INVALID_FILE_TYPE';
        return cb(error);
      }
    }
    
    cb(null, true);
  },
  limits: {
    files: 1,
    fileSize: docType === 'ics' ? 2 * 1024 * 1024 : 10 * 1024 * 1024
  }
});

module.exports = {
  uploadCredential: createStorage('credential'),
  uploadProfilePicture: createStorage('profile'),
  uploadIcsFile: createStorage('ics') 
};