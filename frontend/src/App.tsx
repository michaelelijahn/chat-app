import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <div className="p-4 h-screen flex justify-center items-center bg-blue-50 text-black">
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
      </Routes>
    </div>
  )
}

export default App
