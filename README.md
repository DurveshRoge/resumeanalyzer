# Resume Analyzer

A smart internship portal that analyzes resumes and matches students with companies based on their skills and requirements.

## Features

- Student and Company registration
- Resume upload and analysis
- AI-powered matching system
- Internship posting and applications
- Real-time notifications

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Cloud Storage: Cloudinary
- AI/ML: OpenAI API

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/DurveshRoge/resumeanalyzer.git
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd frontend
npm install
```

4. Create a .env file in the backend directory with the following variables:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

5. Start the development servers

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
