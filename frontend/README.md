# WebTest Lab Frontend

This is the frontend application for WebTest Lab, a comprehensive website testing platform.

## Features

- User authentication (register, login, profile management)
- Dashboard for viewing test results
- Create and manage website tests
- Detailed reports for performance, security, accessibility, and SEO tests

## Technology Stack

- React.js
- React Router for navigation
- Axios for API calls
- CSS utility classes for styling

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Install dependencies:
```
npm install
```

2. Start the development server:
```
npm start
```

This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects the app from Create React App

## Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/              # Page components
├── services/           # API services
├── utils/              # Utility functions
├── App.js              # Main application component
└── index.js            # Application entry point
```

## Tailwind CSS Integration

This project uses Tailwind CSS v4 for styling. The project includes fallback utility classes in `index.css` in case Tailwind doesn't load correctly.

## Backend API Integration

The frontend communicates with the WebTest Lab backend API for:
- User authentication
- Test creation and management
- Retrieving test results

## Author

Ankit Kumar Lakra
