import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from "../../supabase";

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    loadSession();
  }, []);

  // masih loading → jangan redirect dulu
  if (session === undefined) {
    return null;
  }

  // tidak ada session → redirect ke login
  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}
