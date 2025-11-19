
import React from 'react';
import Header from './components/Header';
import PromptGenerator from './components/PromptGenerator';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <PromptGenerator />
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Google Gemini. Designed for creative inspiration.</p>
      </footer>
    </div>
  );
};

export default App;
