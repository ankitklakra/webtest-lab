import React from 'react';
import { Link } from 'react-router-dom';

const TestTypeCard = ({ title, description, icon, route, color, hoverColor }) => {
  return (
    <Link to={route} className="block">
      <div className={`rounded-lg shadow-md overflow-hidden transition duration-300 transform hover:scale-105 ${color} text-white hover:shadow-lg`}>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-white p-2 mr-3">
              <div className={`${color.replace('bg-', 'text-')}`}>
                {icon}
              </div>
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          <p className="text-white text-opacity-90">{description}</p>
          <div className={`mt-4 flex justify-end ${hoverColor} rounded-full py-1 px-3 w-fit ml-auto`}>
            <span className="text-sm font-medium">Start Testing</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TestTypeCard; 