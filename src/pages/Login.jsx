import { useState } from "react";
import supabase from "../../supabase";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      Swal.fire({
        title: "Login Gagal",
        text: "Email dan password wajib diisi.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const removeGmailSuffix = (value) => {
      if (!value) return value;
      let hapus = value.endsWith("@gmail.com") ? value.slice(0, -"@gmail.com".length) : value;
      return hapus;
    };

    const finalEmail = removeGmailSuffix(email) + "@gmail.com";

    const { data, error } = await supabase.auth.signInWithPassword({
      email: finalEmail,
      password,
    });

    if (error) {
      Swal.fire({
        title: "Login Gagal",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-[#FFDD9C] flex items-center justify-center px-4 py-10 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-[#E73F1E] border border-[#FB6C00] rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[#F9B637] sm:text-4xl">Login Admin</h1>
          <p className="mt-2 text-sm text-[#FFDD9C] sm:text-base">Masuk untuk mengelola data UNO</p>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-[#FFDD9C]">Username</span>
            <input
              type="text"
              className="mt-2 w-full rounded-2xl border border-[#FB6C00] bg-[#FFDD9C] px-4 py-3 text-[#E73F1E] outline-none transition focus:border-[#FB6C00] focus:bg-[#FFDD9C] focus:ring-2 focus:ring-[#F9B637]/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#FFDD9C]">Password</span>
            <input
              type="password"
              placeholder="Password"
              className="mt-2 w-full rounded-2xl border border-[#FB6C00] bg-[#FFDD9C] px-4 py-3 text-[#E73F1E] outline-none transition focus:border-[#FB6C00] focus:bg-[#FFDD9C] focus:ring-2 focus:ring-[#F9B637]/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button
            onClick={handleLogin}
            className="w-full rounded-2xl bg-[#FB6C00] px-4 py-3 text-base sm:text-lg font-semibold text-[#FFDD9C] shadow-sm transition hover:bg-[#E73F1E] focus:outline-none focus:ring-2 focus:ring-[#F9B637] focus:ring-offset-2 focus:ring-offset-[#FFDD9C]"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
