import React from 'react';

const Footer = () => {
  return (
    <footer className="px-4 sm:px-6 md:px-8 lg:px-12 py-6 bg-gray-900 text-gray-50">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-4 text-center">
        <div className="min-w-0 w-full">
          <h2 className="mb-2 text-base sm:text-lg md:text-xl font-semibold">UNO</h2>
          <p className="leading-relaxed text-sm sm:text-base">Dirancang untuk memudahkan bermain UNO</p>
        </div>
      </div>
      <div className="mt-6 text-center text-xs sm:text-sm text-gray-400">
        © {new Date().getFullYear()} UNO. Semua hak cipta dilindungi.
      </div>
    </footer>
  );
};

export default Footer;
