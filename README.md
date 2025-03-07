# Inventory Management System

A modern inventory management system built with React, Express, and TypeScript.

## Deployment Instructions

### Prerequisites
- Node.js 20 or later
- npm or yarn

### Building the Application

1. Install dependencies:
```bash
npm install
```

2. Build the application:
```bash
npm run build
```

This will create a `dist` folder containing:
- `dist/public` - Frontend static files
- `dist/index.js` - Backend server

### Environment Variables

Configure these environment variables on your server:

- `PORT` - Server port (default: 5000)
- `HOST` - Server host (default: 0.0.0.0)
- `ALLOWED_ORIGIN` - Allowed CORS origin (default: *)
- `NODE_ENV` - Set to 'production' for production mode

### Running on Your Server

1. Transfer the `dist` folder to your server
2. Set up environment variables
3. Install production dependencies:
```bash
npm install --production
```
4. Start the server:
```bash
npm start
```

The application will be available at `http://your-server:PORT`

## Development

For local development:
```bash
npm run dev
```
