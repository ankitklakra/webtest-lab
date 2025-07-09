# WebTest Lab

A SaaS platform for automated website testing, including performance, security, SEO, and accessibility audits.

## Project Status

**Current State:**
- Fully functional prototype
- Responsive, modern UI (login, register, dashboard, navbar, test pages)
- Inline collapsible mobile menu for easy navigation on all devices
- Friendly onboarding for new users 
- Robust error handling for registration, login, and dashboard
- Detailed test result visualization and history

## Features

- User authentication (register, login, profile management)
- Comprehensive test reports for web applications
- Performance and accessibility testing with Google Lighthouse
- Security scanning 
- SEO testing and recommendations
- Browser compatibility and accessibility testing (axe-core)
- User-friendly dashboard and test management
- Historical test data analysis
- Responsive design for all devices

## Technology Stack

- **Frontend:** React.js, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Testing Tools:** Google Lighthouse, Puppeteer, axe-core

## Quick Start

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local or cloud)

### Installation

1. **Clone the repository**
   ```
   git clone https://github.com/ankitklakra/webtest-lab.git
   cd webtest-lab
   ```

2. **Install backend dependencies**
   ```
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   npm run dev
   ```

3. **Install frontend dependencies**
   ```
   cd ../frontend
   npm install
   npm start
   ```
   The frontend will run at [http://localhost:3000](http://localhost:3000)

## How to Use

1. **Register a new account** or log in with existing credentials.
2. **Dashboard**: View your test stats, recent tests, and available test types.
3. **Run a Test**: Choose a test type (Performance, Security, Accessibility, SEO, Browser) and enter your website URL.
4. **View Results**: See detailed reports, scores, and recommendations for each test.
5. **Test History**: Access all your previous tests and results from the dashboard or the "Results" page.
6. **Mobile Friendly**: All pages are fully responsive and easy to use on any device.

## Project Structure

```
webtest-lab/
├── backend/         # Express.js API
├── frontend/        # React.js app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── ...
│   └── ...
└── README.md
```

## License

[ISC License](LICENSE)

## Author

Ankit Kumar Lakra 