# SnapCut AI

SnapCut AI is an AI-powered web application that removes image backgrounds in one click and provides transparent PNG results. Designed for high performance and smooth user workflows, it features automated image processing, user accounts, and a credit-based system.

## Features

- AI background removal
- User authentication
- Free starter credits
- Credit-based processing
- Processing history
- Razorpay test-mode payments
- Pro and Business plans
- Responsive modern UI

## Tech Stack

### Frontend
- React
- Vite
- TypeScript
- React Router

### Backend
- Node.js
- Express

### Services
- Supabase — authentication and PostgreSQL
- Cloudinary — image processing
- Razorpay — test-mode payments

## Project Structure

- `src/`: React frontend application source code including components, pages, hooks, and context.
- `backend/`: Node.js Express backend server handling API endpoints, payment verification, and Cloudinary processing.
- `public/`: Static web assets, branding icons, and public browser files.

## Local Setup

```bash
git clone <repository-url>
cd snapcut-ai
npm install
```

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd ..
npm run dev
```

Frontend and backend run separately during development.

## Environment Variables

Use `.env.example` as the template to set up your environment variables.

### Frontend
- `VITE_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_RAZORPAY_KEY_ID`

### Backend
- `FRONTEND_URL`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## How It Works

Upload image
→ Express backend
→ Cloudinary AI
→ Background removed
→ Result returned
→ Credit deducted
→ History saved

For payments:

Pricing
→ Razorpay test checkout
→ Backend verification
→ Credits added
→ Plan updated

## Deployment

- Frontend can be deployed as a Vite static site.
- Backend can be deployed as a Node/Express web service.
- Environment variables must be configured on the hosting platform.
- Current Razorpay integration uses TEST MODE.

## Future Improvements

- Bulk background removal
- Background replacement
- More image editing tools
- Improved scalability

## License

This project is currently intended for educational and portfolio purposes.
