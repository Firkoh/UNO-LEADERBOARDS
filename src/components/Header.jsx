import React, { useState } from 'react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 bg-slate-900 text-white shadow-md z-50">
      <nav className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/Uno.png" alt="UNO icon" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" />
          <div className="text-base sm:text-lg md:text-2xl font-semibold">UNO SCORE</div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col gap-1.5 focus:outline-none"
          aria-label="Toggle menu"
        >
          <span className="w-6 h-0.5 bg-white transition-transform duration-300"></span>
          <span className="w-6 h-0.5 bg-white transition-transform duration-300"></span>
          <span className="w-6 h-0.5 bg-white transition-transform duration-300"></span>
        </button>

        <ul className="hidden md:flex items-center gap-6 text-sm sm:text-base">
          <li>
            <a href="/" className="hover:text-yellow-300 transition-colors duration-150">Home</a>
          </li>
          <li>
            <a href="/Login" className="hover:text-yellow-300 transition-colors duration-150">Login</a>
          </li>
        </ul>

        {isOpen && (
          <ul className="absolute top-full left-0 right-0 bg-slate-800 flex flex-col gap-3 p-4 md:hidden z-20 shadow-lg">
            <li>
              <a href="/" className="block text-base sm:text-lg hover:text-yellow-300 transition-colors duration-150">Home</a>
            </li>
            <li>
              <a href="#Leaderboard" className="block text-base sm:text-lg hover:text-yellow-300 transition-colors duration-150">Leaderboard</a>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
};

export default Header;
