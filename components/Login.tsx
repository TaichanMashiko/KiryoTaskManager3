
import React from 'react';
import { GoogleIcon } from './Icons';

interface LoginProps {
  onLoginClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginClick }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-sm w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">KiryoTaskManager</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Welcome! Please sign in to continue.</p>
        <button
          onClick={onLoginClick}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <GoogleIcon className="w-5 h-5 mr-2" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
   