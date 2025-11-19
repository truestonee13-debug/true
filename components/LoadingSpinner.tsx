
import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">AI가 걸작을 만들고 있습니다...</p>
        </div>
    );
};

export default LoadingSpinner;
