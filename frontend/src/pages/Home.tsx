import { useState } from "react";
import SideBar from "../components/sidebar/SideBar";
import UserChats from "../components/userChats/UserChats";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthContext();

  const handleUserLogOut = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setUser(null);
    } catch (error: any) {
      console.error(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2 w-full justify-start">
      <div className="flex gap-5 w-[95%] h-[92.5vh]">
        <SideBar/>
        <UserChats/>
      </div>
      <button className="btn btn-primary w-fit" onClick={handleUserLogOut}>
          Log Out
      </button>
    </div>
  )
}

export default Home