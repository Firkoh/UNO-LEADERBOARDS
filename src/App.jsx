import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import  supabase  from "../supabase";
import Header from "./components/Header";
import Leaderboard from "./components/Leaderboard";
import Login from "./pages/Login";
import AdminPage from "./pages/AdminPage";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import EditLeaderBoard from "./pages/EditLeaderBoard";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/*" element={<Leaderboard />} />
        <Route path="/login" element={<Login />} />
         <Route
    path="/admin"
    element={
      <ProtectedRoute>
        <AdminPage />
        <EditLeaderBoard />
      </ProtectedRoute>
    }
  />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
