import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-auto">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} WebTest Lab. All rights reserved.</p>
        <p className="text-sm mt-2">
          Created by Ankit Kumar Lakra
        </p>
      </div>
    </footer>
  );
};

export default Footer; 