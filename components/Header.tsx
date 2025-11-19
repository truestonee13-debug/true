
import React from 'react';

const FilmReelIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v2h2V4H4zm4 0v2h2V4H8zm4 0v2h2V4h-2zm4 0v2h2V4h-2zM4 8v2h2V8H4zm14 0v2h2V8h-2zM4 12v2h2v-2H4zm14 0v2h2v-2h-2zM4 16v2h2v-2H4zm4 0v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zM4 20v-2h2v2H4z"></path>
    </svg>
);

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
          <FilmReelIcon className="w-8 h-8 text-cyan-400"/>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            성경 기반 비디오 프롬프트 생성기
          </h1>
        </div>
        <p className="text-sm text-gray-400 text-center sm:text-right">
          성경 구절을 영화적 걸작으로 변환하세요
        </p>
      </div>
    </header>
  );
};

export default Header;
