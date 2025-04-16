# WebTest Lab

A SaaS platform for automated website testing, including performance, security, SEO, and accessibility audits.

## Features

- Comprehensive test reports for web applications
- Performance and accessibility testing with Google Lighthouse
- Security scanning with OWASP ZAP
- UI automation testing using Selenium and Puppeteer
- Load testing with JMeter/k6
- User-friendly dashboard
- Scheduled automated testing
- Historical test data analysis

## Technology Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB/Firebase
- **Testing Tools**: Google Lighthouse, Selenium, Puppeteer, JMeter/k6, OWASP ZAP

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/webtest-lab.git
cd webtest-lab
```

2. Install dependencies
```
npm install
cd frontend
npm install
npm run setup-tailwind  # This sets up Tailwind CSS correctly
cd ../backend
npm install
```

3. Set up environment variables
```
cp backend/.env.example backend/.env
```
Edit the .env file with your configuration

4. Start the development server
```
npm run dev
```

## License

[ISC License](LICENSE)

## Author

Ankit Kumar Lakra 