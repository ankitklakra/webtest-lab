import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 via-indigo-700 to-blue-800 p-4 shadow-md relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          WebTest Lab
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex">
          <ul className="flex space-x-6 items-center">
            {userInfo ? (
              <>
                <li>
                  <Link to="/dashboard" className="text-white hover:text-blue-200">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/tests" className="text-white hover:text-blue-200">
                  Results
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      logoutHandler();

                    }}
                    className="text-white text-left"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="text-white hover:text-blue-200">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-white hover:text-blue-200">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Mobile menu button */}
        <button
          className="lg:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden w-full mt-2">
          <nav className="bg-blue-700 rounded-md shadow-md p-4 mx-0">
            <ul className="flex flex-col space-y-2">
              {userInfo ? (
                <>
                  <li>
                    <Link to="/dashboard" className="text-white block py-2 px-2 rounded hover:bg-blue-600 transition" onClick={toggleMenu}>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                  <Link to="/tests" className="text-white block py-2 px-2 rounded hover:bg-blue-600 transition" onClick={toggleMenu}>
                    Results
                  </Link>
                </li>
                  <li>
                    <button
                      onClick={() => {
                        logoutHandler();
                        toggleMenu();
                      }}
                      className="text-white block py-2 px-2 rounded hover:bg-blue-600 transition text-left w-full"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-white block py-2 px-2 rounded hover:bg-blue-600 transition" onClick={toggleMenu}>
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-white block py-2 px-2 rounded hover:bg-blue-600 transition" onClick={toggleMenu}>
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
