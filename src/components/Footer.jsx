import React from 'react';

const Footer = () => {
  return (
    <footer className="px-6 py-6 bg-gray-900 text-gray-50">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-4 text-center">
        <div className="min-w-60">
          <h2 className="mb-3 text-lg font-semibold">UNO</h2>
          <p className="leading-relaxed">Dirancang untuk memudahkan bermain UNO</p>
        </div>
      </div>
      <div className="mt-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} UNO. Semua hak cipta dilindungi.
      </div>
    </footer>
  );
};

export default Footer;
