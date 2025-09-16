import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col justify-center items-center z-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">FinTrack</h1>
        <p className="text-lg text-gray-400 mb-8">Powered by @santhosh sharuk</p>
        <div className="flex justify-center items-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
