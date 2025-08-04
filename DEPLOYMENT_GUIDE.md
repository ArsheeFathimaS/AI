# MyZayna Deployment Guide

## Overview
MyZayna is a virtual girlfriend app with a React frontend and Node.js backend that uses Python for text-to-speech functionality.

## Prerequisites
- Node.js (v16 or higher)
- Python 3.13+ with venv support
- npm or yarn

## Quick Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd myzayna_backend/myzayna_backend_main
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Install Python dependencies (automatically creates virtual environment):
   ```bash
   npm run install-python-deps
   ```

4. Create a `.env` file with your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. Start the backend:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd myzayna_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Deployment on Render

### Backend Deployment
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command:
   ```bash
   cd myzayna_backend/myzayna_backend_main && npm install
   ```
4. Set the start command:
   ```bash
   cd myzayna_backend/myzayna_backend_main && npm start
   ```
5. Add environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `PORT`: 3000 (or leave default)

### Frontend Deployment
1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Set the build command:
   ```bash
   cd myzayna_frontend && npm install && npm run build
   ```
4. Set the publish directory: `myzayna_frontend/dist`

## Troubleshooting

### Common Issues

#### 1. "ModuleNotFoundError: No module named 'gtts'"
**Solution:**
```bash
cd myzayna_backend/myzayna_backend_main
npm run install-python-deps
```

#### 2. "externally-managed-environment" Error
This happens on some Linux systems. The project now uses virtual environments automatically.

#### 3. Python Virtual Environment Issues
If you encounter venv issues:
```bash
# Install required system packages (Ubuntu/Debian)
sudo apt update
sudo apt install -y python3-venv python3-pip

# Then run the setup again
npm run install-python-deps
```

#### 4. Backend Connection Issues
- Ensure the backend is running on port 3000
- Check that CORS is properly configured
- Verify the frontend is pointing to the correct backend URL

#### 5. Audio Generation Failures
- Check that the `audios/` directory exists in the backend
- Ensure Python dependencies are installed correctly
- Verify the virtual environment is activated

### Responsive Design Features
The frontend now includes:
- Mobile-first responsive design
- Proper touch targets (44px minimum)
- Responsive typography and spacing
- Stack layout on mobile devices
- Safe area insets for mobile browsers

### Performance Optimizations
- Virtual environment for Python dependencies
- Better error handling and logging
- Optimized CSS with Tailwind utilities
- Proper mobile viewport configuration

## Environment Variables

### Backend (.env)
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### Frontend
No environment variables required for basic setup.

## File Structure
```
/
├── myzayna_backend/
│   └── myzayna_backend_main/
│       ├── venv/                 # Python virtual environment
│       ├── audios/              # Generated audio files
│       ├── tools/               # Rhubarb lip sync tools
│       ├── index.js             # Main backend server
│       ├── gtts_speak.py        # Text-to-speech script
│       ├── requirements.txt     # Python dependencies
│       └── package.json         # Node.js dependencies
└── myzayna_frontend/
    ├── src/
    │   ├── components/          # React components
    │   ├── hooks/              # Custom hooks
    │   └── assets/             # Static assets
    ├── index.html              # Main HTML file
    └── package.json            # Frontend dependencies
```

## Support
If you encounter issues not covered in this guide, check:
1. Backend logs for error messages
2. Browser console for frontend errors
3. Python virtual environment activation
4. Network connectivity between frontend and backend