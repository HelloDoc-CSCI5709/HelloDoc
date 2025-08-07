#  HelloDoc - Advanced Telehealth Platform

<div>


**Connecting patients and healthcare providers through secure, innovative web technology**


</div>

##  Overview

HelloDoc is a comprehensive telehealth platform that revolutionizes healthcare delivery through secure virtual consultations, intelligent appointment management, and robust digital health records. Built for the modern healthcare landscape, it provides seamless experiences for patients, doctors, and administrators.

##  Key Features

###  **Advanced Security**
- **2-Factor Authentication** - Password +  Security Questions
- **Encrypted chats** - Hybrid RSA + AES encryption for all communications
- **Role-Based Access Control** - Secure patient, doctor, and admin portals
- **OWASP Compliance** - Security tested with ZAP DAST scanning

###  **Smart Appointment System**
- **Real-time Booking** - Live availability checking and instant confirmations
- **Calendar Integration** - .ics file import/export for seamless scheduling
- **Flexible Management** - Easy rescheduling and cancellation

###  **Digital Health Records**
- **Document Management** - Secure upload and storage of health documents
- **Prescription tracking** - Digital prescription management
- **Medical History** - Comprehensive patient record maintenance
- **Document Preview** - Real-time preview of uploaded files

###  **Custom Video Calling**
- **Built-in Video Calls** - Proprietary WebRTC implementation
- **HD Quality** - High-definition video and audio
- **Secure Sessions** - Encrypted peer-to-peer connections
- **Screen Sharing** - Advanced consultation features

###  **Encrypted Messaging**
- **Secure Chat** - End-to-end encrypted patient-doctor communication
- **Real-time Messaging** - Instant message delivery with Socket.IO
- **Appointment-scoped** - Messages organized by consultation sessions
- **File Sharing** - Secure document and image sharing

###  **Location Intelligence**
- **Smart Address Detection** - Auto-complete with Google Places API

##  Tech Stack

<table>
<tr>
<td>

**Frontend**
- React 18 + TypeScript
- Tailwind CSS
- React Router
- Socket.IO Client
- Google Maps API

</td>
<td>

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO
- Multer (File Upload)

</td>
</tr>
<tr>
<td>

**Security**
- bcrypt Password Hashing
- RSA + AES Encryption
- CORS Protection
- Rate Limiting
- Input Validation

</td>
<td>

**Infrastructure**
- MongoDB Atlas
- GitHub Actions (CI/CD)

</td>
</tr>
</table>

##  Quick Start

### Prerequisites

- **Node.js** ≥ 18.0.0  
- **npm** or **yarn**  
- **MongoDB** (local or Atlas)  
- **Git**

---

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/HelloDoc-CSCI5709/HelloDoc.git
cd HelloDoc
```

#### 2. Setup Backend

```bash
cd backend
npm install
```

- Create a `.env` file in the `backend/` directory (see configuration below)
- Start the backend server:

```bash
npm run dev
```

#### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

#### 4. Access the Application

- **Frontend**: http://localhost:5147  
- **Backend**: http://localhost:5050  
- **Live URL** (optional): http://192.168.2.32:5173

---

### 🔧 Environment Configuration

Create a `.env` file inside the `backend/` folder with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/hellodoc

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
ENCRYPTION_IV= yout-encyrption-IV

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_PORT=your-port

# App Settings
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```
Create a `.env` file inside the `frontend/` folder with the following variables:
```env
VITE_GOOGLE_MAPS_API_KEY=your-API-key
VITE_BACKEND_BASE_URL=your-backend-url
```

##  User Roles & Features

###  **Patients**
- **Secure Registration** with 2-factor authentication
- **Doctor Discovery** with location-based search
- **Appointment Booking** with real-time availability
- **Health Document Upload** with secure storage
- **Video Consultations** with encrypted communication
- **Prescription Management** and history tracking

###  **Doctors**
- **Professional Profiles** with credential management
- **Availability Management** with calendar integration
- **Patient Communication** via secure messaging
- **Video Consultations** with advanced features
- **Medical Record Access** for assigned patients

###  **Administrators**
- **User Management** for patients and doctors
- **Appointment Oversight** and analytics
- **System Monitoring** and performance metrics
- **Credential Verification** for healthcare providers
- **Platform Analytics** and reporting tools


##  Testing

To run backend tests:

```bash
cd backend
npm test            # Run all tests
npm run test:coverage  # Generate coverage report
```

---

##  Performance

Our optimization efforts achieved significant improvements:

| Metric         | Before | After | Improvement |
|----------------|--------|--------|-------------|
| Response Time  | 850 ms | 320 ms | ↓ 62%       |
| Requests/sec   | 12.4   | 29.7   | ↑ 139%      |
| Error Rate     | 3.5%   | 0.6%   | ↓ 83%       |

---

##  Deployment

### Production Build

**Backend**
```bash
cd backend
npm run build
npm start
```

**Frontend**
```bash
cd frontend
npm run build
```

### Hosting Recommendations

- **Backend**: Render, Railway, AWS EC2, or similar
- **Frontend**: Netlify, Vercel
- **Database**: MongoDB Atlas (production-grade)
- **Media CDN**: Cloudinary or AWS S3

---

##  Contributing

1. Fork the repository
2. Create your feature branch:  
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:  
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch:  
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **CSCI 5709** - Advanced Topics in Web Development
- **Dalhousie University** - Academic support and resources
- **MongoDB Atlas** - Database hosting
- **Render** - Application hosting
- **Google APIs** - Maps and location services


