import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  // For demo purposes, we'll just check if user info exists in localStorage
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          WebTest Lab
        </Link>
        <nav>
          <ul className="flex space-x-4">
            {userInfo ? (
              <>
                <li>
                  <Link to="/dashboard" className="text-white hover:text-blue-200">
                    Dashboard
                  </Link>
                </li>

                <li>
                  <div className="relative group">
                    <div className="text-white hover:text-blue-200 cursor-pointer">
                      {userInfo.name}
                    </div>

                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-10">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-800 hover:bg-blue-100"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={logoutHandler}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>


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
      </div>
    </header>
  );
};

export default Header; 