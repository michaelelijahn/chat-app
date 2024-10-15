import Avatar from '@mui/material/Avatar';

const Profile = () => {
  return (
    <div className="flex items-center gap-2 p-2 py-1 cursor-pointer mx-2 hover:bg-slate-100 rounded-xl">
        <div>
            <Avatar src="/broken-image.jpg" />
        </div>
        <div className='flex flex-col flex-1'>
            <p className='font-semibold'>John Doe</p>
            {/* <div className='flex gap-3 justify-between'>
                <p className='font-semibold'>John Doe</p>
                <span classname='text-xl'>emoji</span>
            </div> */}
        </div>

        {/* <div className='divider my-0 py-0 h-1'>
        </div> */}
    </div>
  )
}

export default Profile