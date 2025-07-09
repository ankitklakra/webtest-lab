import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Footer from './components/Footer';
import Navbar from './components/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TestDetailPage from './pages/TestDetailPage';
import PerformanceTestPage from './pages/PerformanceTestPage';
import SecurityTestPage from './pages/SecurityTestPage';
import AccessibilityTestPage from './pages/AccessibilityTestPage';
import BrowserTestPage from './pages/BrowserTestPage';
import SeoTestPage from './pages/SeoTestPage';
import AllTestsPage from './pages/AllTestsPage';

// Axios configuration for API requests
import axios from 'axios';
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
       
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tests" element={<AllTestsPage />} />
            <Route path="/tests/:id" element={<TestDetailPage />} />
            <Route path="/performance-test" element={<PerformanceTestPage />} />
            <Route path="/security-test" element={<SecurityTestPage />} />
            <Route path="/accessibility-test" element={<AccessibilityTestPage />} />
            <Route path="/browser-test" element={<BrowserTestPage />} />
            <Route path="/seo-test" element={<SeoTestPage />} />
            
          </Routes>
    
        <Footer />
      </div>
    </Router>
  );
}

export default App;
