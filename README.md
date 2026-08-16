# SnapCut AI — AI Background Remover

SnapCut AI is an AI-powered web application that automatically removes background from images in seconds, outputting high-resolution transparent PNG cutouts.

---

## Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router (v7)
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives + Tailwind CSS

### Backend
- **Runtime**: Node.js (ES Modules)
- **Server Framework**: Express.js
- **File Upload Middleware**: Multer (In-memory buffer processing)
- **AI Processing Engine**: Cloudinary AI Background Removal SDK
- **Security & Rate Limiting**: `express-rate-limit`, CORS configuration

---

## System Architecture

```text
┌───────────────────────────┐         ┌───────────────────────────┐         ┌───────────────────────────┐
│     React/Vite Client     │ ──────> │   Node/Express Backend    │ ──────> │    Cloudinary AI Engine   │
│   (http://localhost:5173) │ <────── │   (http://localhost:5000) │ <────── │ (Background Removal API)  │
└───────────────────────────┘         └───────────────────────────┘         └───────────────────────────┘
```

1. **Client-Side File Selection**: The user selects or drops an image on the Dashboard dropzone (validated for image MIME type and 10MB size limit).
2. **In-Memory Upload Stream**: The client posts multipart form data to `POST /api/remove-background`. Multer buffers the image in RAM (no disk persistence).
3. **Cloudinary AI Transformation**: The backend streams the buffer to Cloudinary, triggering AI background removal (`background_removal: "cloudinary_ai"`).
4. **Transparent PNG Output**: The backend returns the transparent PNG cutout URL (`format: "png"`), which is displayed in an interactive Before/After viewer.

---

## Project Structure

```text
snapcut-ai/
├── backend/
│   ├── config/
│   │   └── cloudinary.js        # Cloudinary SDK configuration
│   ├── middleware/
│   │   ├── rateLimiter.js       # Express rate limiting
│   │   └── upload.js            # Multer memory storage & MIME validation
│   ├── routes/
│   │   └── uploadRoutes.js      # /api/remove-background & /api/test-upload routes
│   ├── services/
│   │   └── cloudinaryService.js # Cloudinary upload & background removal logic
│   ├── .env.example
│   ├── index.js                 # Express server entry point
│   └── package.json
├── public/
│   ├── favicon.svg              # SnapCut AI custom brand icon
│   └── robots.txt
├── src/
│   ├── components/              # UI components (UploadZone, BeforeAfter, etc.)
│   ├── lib/
│   │   ├── api.ts               # Frontend API client & health check
│   │   └── utils.ts             # Tailwind class merge helper
│   ├── routes/                  # React Router page components
│   ├── App.tsx                  # App routing setup
│   └── main.tsx                 # React DOM root entry
├── index.html
├── package.json
└── vite.config.ts
```

---

## Environment Variables

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000
```

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=30
```

---

## Local Development Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 1. Installation

Install frontend dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

### 2. Running Locally

Start the Express backend server (Port 5000):
```bash
cd backend
npm run dev
```

In a second terminal, start the React/Vite development server (Port 5173):
```bash
npm run dev
```

Access the frontend at `http://localhost:5173`.

---

## Implemented Features

- [x] AI Background Removal processing images via Cloudinary.
- [x] Interactive Before/After image comparison slider.
- [x] One-click transparent PNG image download.
- [x] Drag-and-drop file upload with client-side and server-side file validation (10MB max, PNG/JPG/WEBP).
- [x] Backend status indicator showing real-time health connection state (`Backend Connected` / `Backend Offline`).
- [x] Strict error sanitization and security rate limiting (`express-rate-limit`).

---

## Planned Features

- [ ] User authentication and profile management.
- [ ] User credit balance system and payment integrations.
- [ ] Cloud history storage for processed images.
- [ ] Batch background removal for multiple images simultaneously.
