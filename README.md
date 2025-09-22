# B.O.F Certification Automation Platform

A modern web application for automating certificate generation and distribution for Bourdillon Omijeh Foundation courses.

## Features

- 📁 CSV file upload with drag-and-drop support
- 🎓 Automated certificate generation for multiple courses
- 👨‍💼 Admin interface with batch processing controls
- 📧 Integration-ready for email distribution
- 📱 Responsive design for all devices
- 🔒 Secure admin authentication

## Supported Courses

- Data Analysis/Analytics
- MS Office for Administrators  
- Python Programming
- Cybersecurity

## File Format Requirements

Your file must contain the following columns and can be in any of these formats:

**Supported Formats:**
- CSV (.csv)
- Excel (.xlsx, .xls)
- OpenDocument Spreadsheet (.ods)

**Required Columns:**

```csv
Name,Email,Course
John Doe,john@example.com,Data Analysis/Analytics
Jane Smith,jane@example.com,"Data Analysis/Analytics, Python Programming"
```

**Alternative Column Names Supported:**
- Course/Courses (both work)
- Name/Full Name/Candidate Name
- Email/Email Address/E-mail

**Important Notes:**
- Multiple courses should be comma-separated
- Email addresses must be valid
- Names should be properly formatted as they appear on certificates
- The system automatically maps common course name variations to standard names

## Admin Access

- **Password:** `B.O.dev123`

## Frontend Deployment (Vercel)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel:**
   - `VITE_BACKEND_URL`: Your Next.js backend URL (e.g., `https://your-app.render.com`)

## Backend Setup (Next.js on Render)

Create a separate Next.js project with the following API endpoint:

### 1. Create Next.js Backend

```bash
npx create-next-app@latest certificate-backend
cd certificate-backend
npm install nodemailer @types/nodemailer
```

### 2. API Endpoint: `/pages/api/send-certificates.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

interface CertificateBatch {
  candidates: {
    name: string;
    email: string;
    courses: string[];
    certificatesGenerated: number;
  }[];
  metadata: {
    totalCandidates: number;
    totalCertificates: number;
    exportDate: string;
    batchId: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const batchData: CertificateBatch = req.body;

    // Configure your email transport
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // or your preferred service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const emailPromises = batchData.candidates.map(async (candidate) => {
      const emailContent = `
        Dear ${candidate.name},

        Congratulations! You have successfully completed the following course(s):
        ${candidate.courses.map(course => `• ${course}`).join('\n')}

        Your certificates have been generated and are attached to this email.

        Best regards,
        Bourdillon Omijeh Foundation (B.O.F)
      `;

      return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: candidate.email,
        subject: 'Your Course Completion Certificates - B.O.F',
        text: emailContent,
        // Add PDF attachments here when integrating with your certificate storage
      });
    });

    await Promise.all(emailPromises);

    res.status(200).json({
      success: true,
      message: `Successfully sent certificates to ${batchData.candidates.length} candidates`
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send certificates'
    });
  }
}
```

### 3. Environment Variables (.env.local)

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 4. Deploy to Render

1. **Create a new Web Service on Render**
2. **Connect your GitHub repository**
3. **Set build command:** `npm install && npm run build`
4. **Set start command:** `npm start`
5. **Add environment variables in Render dashboard**

### 5. Integration Endpoints

#### Send Certificates (POST)
```
POST /api/send-certificates
Content-Type: application/json

{
  "candidates": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "courses": ["Data Analysis/Analytics"],
      "certificatesGenerated": 1
    }
  ],
  "metadata": {
    "totalCandidates": 1,
    "totalCertificates": 1,
    "exportDate": "2025-01-27T10:00:00.000Z",
    "batchId": "batch_1737975600000"
  }
}
```

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Technical Architecture

- **Frontend:** React + TypeScript + Tailwind CSS
- **PDF Generation:** jsPDF
- **CSV Processing:** PapaParse
- **File Handling:** HTML5 File API
- **State Management:** React useState/useEffect
- **Styling:** Tailwind CSS with custom green theme

## Security

- Admin authentication required for all operations
- File validation and sanitization
- Secure data handling throughout the pipeline

## Support

For technical support or questions, please contact the development team.