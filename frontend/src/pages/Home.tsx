import SideBar from "../components/sidebar/SideBar";
import UserChats from "../components/userChats/UserChats";

const Home = () => {
  return (
    <div className="flex gap-2 w-full justify-start">
      <div className="flex gap-5 w-[95%] h-[92.5vh]">
        <SideBar/>
        <UserChats/>
      </div>
      <button className="btn btn-primary w-fit">
          Log Out
      </button>
    </div>
  )
}

export default Home