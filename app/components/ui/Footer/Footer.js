"use client";

import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center">
          <p className="text-sm text-gray-400">
            Powered by{' '}
            <Link 
              href="https://pourdian.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white font-medium transition-colors duration-200"
            >
              Pourdian.com
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 