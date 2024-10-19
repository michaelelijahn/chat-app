import { useState } from 'react';
import Profiles from './Profiles';

const SideBar = () => {
  const [selectedPage, setSelectedPage] = useState('All');
  const pages = ["Friends", "Chat", "Suggested"];
  const [search, setSearch] = useState("");


  const handleClickPages = (p:string) => {
    setSelectedPage(p);
  }

  return (
    <div className='w-[28%] h-full py-3 rounded-xl flex flex-col gap-2 bg-white shadow'>
      <span>
        <div className="bg-white flex px-4 focus-within:border-blue-500 overflow-hidden max-w-md mx-auto font-[sans-serif]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="18px" className="fill-gray-600 mr-3">
            <path
              d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z">
            </path>
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Something..." className="w-full outline-none hover:border-none flex mt-2 p-3 text-sm rounded-lg bg-slate-50 text-gray-500 outline-1" />
        </div>
      </span>
      <div className='flex py-2 mb-4 justify-evenly text-md bg-gray-50 rounded-full mx-2'>
        {
          pages.map((page, index) => (
          <span
            key={page}
            className={`${
              selectedPage === page ? 'text-blue-600' : 'text-black'
            } bg-white px-4 py-2 rounded-full cursor-pointer ${
              index === 0 ? 'ml-2' : index === pages.length - 1 ? 'mr-2' : ''
            }`}
            onClick={() => handleClickPages(page)}
          >
            {page}
          </span>
          ))
        }
      </div>

      <div className=''>
        <Profiles selectedPage={selectedPage} search={search} />
      </div>
    </div>
  )
}

export default SideBar