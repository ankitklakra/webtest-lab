import React from 'react';
import { Link } from 'react-router-dom';

const TestTypeCard = ({ title, description, icon, route, color, hoverColor }) => {
  return (
    <Link to={route} className="block h-full">
      <div className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 transform hover:scale-102 hover:-translate-y-1 hover:shadow-xl ${color} text-white h-full`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <defs>
              <pattern id={`grid-${title}`} width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#grid-${title})`} />
          </svg>
        </div>
        
        <div className="p-6 relative z-10 h-full flex flex-col">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-white bg-opacity-20 backdrop-blur-sm p-2.5 mr-3 shadow-md">
              <div className="text-white">
                {icon}
              </div>
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          <p className="text-white text-opacity-90 text-sm mb-4 flex-grow">{description}</p>
          <div className={`mt-auto self-end flex items-center group`}>
            <span className="text-sm font-medium group-hover:mr-2 transition-all duration-300">Start Testing</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {/* Decorative circle */}
        <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-white bg-opacity-10"></div>
      </div>
    </Link>
  );
};

export default TestTypeCard; 