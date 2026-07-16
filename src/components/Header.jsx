import React, { useState, useEffect } from 'react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY === 0) {
        const newUrl = window.location.pathname + window.location.search;
        window.history.replaceState(null, '', newUrl);
      } else {
        const newUrl = window.location.pathname + window.location.search + '#Leaderboard';
        window.history.replaceState(null, '', newUrl);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="bg-slate-900 text-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/public/Uno.png" alt="UNO icon" className="w-8 h-8 md:w-10 md:h-10" />
          <div className="text-lg md:text-2xl font-semibold">UNO SCORE</div>
        </div>
        
        
        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col gap-1.5 focus:outline-none"
        >
          <span className="w-6 h-0.5 bg-white transition-transform duration-300"></span>
          <span className="w-6 h-0.5 bg-white transition-transform duration-300"></span>
          <span className="w-6 h-0.5 bg-white transition-transform duration-300"></span>
        </button>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6">
          <li>
            <a href="/" className="hover:text-yellow-300 transition-colors duration-150">Home</a>
          </li>
          <li>
            <a href="/Login" className="hover:text-yellow-300 transition-colors duration-150">Login</a>
          </li>
        
        </ul>

        {/* Mobile Menu */}
        {isOpen && (
          <ul className="absolute top-16 left-0 right-0 bg-slate-800 flex flex-col gap-4 p-4 md:hidden">
            <li>
              <a href="/" className="block hover:text-yellow-300 transition-colors duration-150">Home</a>
            </li>
            <li>
              <a href="#Leaderboard" className="block hover:text-yellow-300 transition-colors duration-150">Leaderboard</a>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
};

export default Header;
