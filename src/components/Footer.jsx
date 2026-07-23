import React from "react";
import {FaWhatsapp}  from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="px-4 sm:px-6 md:px-8 lg:px-12 py-6 bg-[#F9B637] text-[#E73F1E]">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-4 text-center">

        <div className="min-w-0 w-full">
          <h2 className="mb-2 text-base sm:text-lg md:text-xl font-semibold">
            UNO
          </h2>

          <p className="leading-relaxed text-sm sm:text-base">
            Dirancang untuk memudahkan bermain UNO
          </p>

          {/* Kontak WhatsApp */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <FaWhatsapp className="text-2xl text-green-600" />

            <a
              href="https://wa.me/6282248766797?text=Halo%20Firgenius,%20saya%20ingin%20menjadi%20admin%20di%20UNO%20Web%20Games"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              Kontak Admin Web Untuk Menjadi Admin.
            </a>
          </div>

        </div>
      </div>

      <div className="mt-6 text-center text-xs sm:text-sm text-[#E73F1E]">
        © {new Date().getFullYear()} UNO. Semua hak cipta dilindungi.
      </div>
    </footer>
  );
};

export default Footer;