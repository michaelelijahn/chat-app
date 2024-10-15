import { useState } from 'react';
import SearchBar from './SearchBar';
import Profiles from './Profiles';

const SideBar = () => {
  const [selectedPage, setSelectedPage] = useState('All');

  const pages = ["All", "Friends", "Suggested"];

  const handleClickPages = (p:string) => {
    setSelectedPage(p);
  }

  return (
    <div className='w-[28%] h-full py-3 rounded-xl flex flex-col gap-2 bg-white shadow'>
      <span>
        <SearchBar/>
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
        <Profiles />
      </div>
    </div>
  )
}

export default SideBar