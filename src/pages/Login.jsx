import { useState } from "react";
import supabase from "../../supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email + "@gmail.com",
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data.user?.email === "admin@gmail.com") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Login Admin</h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">Masuk untuk mengelola data UNO</p>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email Admin</span>
            <input
              type="email"
              placeholder="adminuno@gmail.com"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              placeholder="Password"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button
            onClick={handleLogin}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-base sm:text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
