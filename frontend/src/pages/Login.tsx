import { useState } from 'react';

const Login = () => {
  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    // api
  }

  return (
    <div className="flex flex-col items-center bg-white w-[85vw] min-w-[352px] sm:max-w-lg md:max-w-2xl gap-4 rounded-3xl p-4 shadow-lg">
      <h1 className="text-3xl mt-3 font-bold">Login <span className='text-blue-600'>chatApp</span> </h1>
      <form className="flex flex-col items-center gap-2 w-full max-w-md" onSubmit={handleFormSubmission}>
        <input type="text" className="input-form" onChange={(e) => setUser((prev) => ({...prev, username: e.target.value}))} placeholder="Username" />
        <input type="password" className="input-form" onChange={(e) => setUser((prev) => ({...prev, password: e.target.value}))} placeholder="Password" />
      </form>
      <button type="submit" className='btn btn-primary btn-md btn-wide mb-4'>Submit</button>
    </div>
  );
};

export default Login;