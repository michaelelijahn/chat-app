import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { useAuthContext } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

function App() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return null;
  }

  return (
    <div className="p-4 h-screen flex justify-center items-center bg-blue-50 text-black">
      <Routes>
        <Route path="/" element={ user ? <Home/> : <Navigate to="/login" />} />
        <Route path="register" element={ !user ? <Register/> : <Navigate to="/" />} />
        <Route path="/login" element={ !user ? <Login/> : <Navigate to="/" />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
