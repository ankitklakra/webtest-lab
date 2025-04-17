# WebTest Lab

A SaaS platform for automated website testing, including performance, security, SEO, and accessibility audits.

## Project Status

**Current State**: Working prototype with functioning:
- User authentication (register, login)
- Testing dashboard
- Multiple test types implementation:
  - Performance testing with Lighthouse
  - Security scanning with OWASP ZAP (simulated)
  - Accessibility testing with axe-core
  - Browser compatibility testing with Selenium (simulated)
  - SEO testing
- Detailed test result visualization
- Test history and management

## Features

- Comprehensive test reports for web applications
- Performance and accessibility testing with Google Lighthouse
- Security scanning with OWASP ZAP
- UI automation testing using Selenium and Puppeteer
- SEO testing and recommendations
- User-friendly dashboard
- Historical test data analysis

## Technology Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Testing Tools**: Google Lighthouse, Puppeteer, axe-core (with plans for Selenium, JMeter/k6)

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

## Testing Types

1. **Performance Testing**: Uses Google Lighthouse to analyze page load metrics, Core Web Vitals, and best practices.
2. **Accessibility Testing**: Implements axe-core to check WCAG compliance and identify accessibility issues.
3. **Security Testing**: Uses simulated OWASP ZAP scanning to identify potential security vulnerabilities.
4. **Browser Compatibility**: Tests website rendering and functionality across different browsers (Chrome, Firefox, Edge, Safari).
5. **SEO Analysis**: Evaluates search engine optimization factors and provides recommendations.

## License

[ISC License](LICENSE)

## Author

Ankit Kumar Lakra 