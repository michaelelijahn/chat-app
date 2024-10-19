import Avatar from '@mui/material/Avatar';
import useConversation from '../../zustand/useConversation';

const Profile = ({ profile } : { profile: {id: string, fullName: string, profilePic: string}}) => {

  const { setSelectedConversation, selectedConversation } = useConversation();
  const isSelected = selectedConversation?.id === profile.id;

  const handleSelectedConversation = (profile:ProfileType ) => {
    if (selectedConversation?.id === profile.id) return;
    setSelectedConversation(profile);
  }

  if (!profile) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 p-2 py-1 cursor-pointer mx-2 rounded-xl ${isSelected ? "bg-slate-200" : ""}`} onClick={() => handleSelectedConversation(profile)}>
        <div>
            <Avatar src="/broken-image.jpg" />
        </div>
        <div className='flex flex-col flex-1'>
            <p className='font-semibold'>{profile?.fullName}</p>
        </div>
    </div>
  )
}

export default Profile