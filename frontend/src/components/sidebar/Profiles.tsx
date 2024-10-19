import { useEffect, useState, useMemo } from "react"
import Profile from "./Profile"
import toast from "react-hot-toast";

type ProfileType = {
  id: string;
  fullName: string;
  profilePic: string;
};

const Profiles = ({ selectedPage, search }: { selectedPage: string, search: string }) => {
  const [loading, setLoading] = useState(false);
  const [allSuggested, setAllSuggested] = useState<ProfileType[]>([]);
  const [allFriends, setAllFriends] = useState<ProfileType[]>([]);
  const [allChats, setAllChats] = useState<ProfileType[]>([]);
  const [edited, setEdited] = useState(false);

  const handleAdd = async (id: string) => {
    try {
      const response = await fetch(`/api/friend/add/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setEdited(true);
      setAllSuggested(prevSuggested => prevSuggested.filter(profile => profile.id !== id));

    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/friend/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }
      setEdited(true);
      setAllFriends(prevFriends => prevFriends.filter(profile => profile.id !== id));

    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    const getFriends = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/friend/all");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setAllFriends(data);
      } catch (error: any) {
        console.log(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    const getChats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/chat/conversations");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setAllChats(data);
      } catch (error: any) {
        console.log(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    const getSuggested = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/friend/suggested");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setAllSuggested(data);
      } catch (error: any) {
        console.log(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    getFriends();
    getChats();
    getSuggested();

    if (edited) {
      setEdited(false);
    }

  }, [edited])

  const filteredFriends = useMemo(() => {
    return allFriends.filter(friend => friend.fullName.toLowerCase().includes(search.toLowerCase()));
  }, [allFriends, search]);

  const filteredChats = useMemo(() => {
    return allChats.filter(chat => chat.fullName.toLowerCase().includes(search.toLowerCase()));
  }, [allChats, search]);

  const filteredSuggested = useMemo(() => {
    return allSuggested.filter(suggested => suggested.fullName.toLowerCase().includes(search.toLowerCase()));
  }, [allSuggested, search]);

  if (loading) {
    return null;
  }

  return (
    <div className='flex flex-col gap-4 overflow-auto max-h-[70vh]'>
      {selectedPage === "Friends" && 
        filteredFriends.map((profile) => (
          <div key={profile.id} className="grid grid-cols-3 items-center w-full">
            <div className="col-span-2">
              <Profile profile={profile} />
            </div>
            <div className="flex justify-end mr-6">
              <button className="btn btn-error" onClick={() => handleDelete(profile.id)}>Delete</button>
            </div>
          </div> 
      ))}

      {selectedPage === "Suggested" && 
        filteredSuggested.map((profile) => (
          <div key={profile.id} className="grid grid-cols-3 items-center w-full">
            <div className="col-span-2">
              <Profile profile={profile} />
            </div>
            <div className="flex justify-end mr-6">
              <button className="btn btn-primary" onClick={() => handleAdd(profile.id)}>Add</button>
            </div>
          </div> 
      ))}

      {selectedPage === "Chat" &&
        filteredChats.map((profile) => <Profile key={profile.id} profile={profile} />)
      }
    </div>
  )
}

export default Profiles