import { useState } from 'react';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { Link } from 'react-router-dom';

const Register = () => {
  const [user, setUser] = useState({
    fullName: "",
    username: "",
    password: "",
    passwordConfirmation: "",
    gender: "",
  });

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    // api
  }

  return (
    <div className="flex flex-col items-center bg-white w-[85vw] min-w-[352px] sm:max-w-lg md:max-w-2xl gap-4 rounded-3xl p-4 shadow-lg">
      <h1 className="text-3xl mt-3 font-bold">Register <span className='text-blue-600'>chatApp</span> </h1>
      <form className="flex flex-col items-center gap-2 w-full max-w-md" onSubmit={handleFormSubmission}>
        <input type="text" className="input-form" onChange={(e) => setUser((prev) => ({...prev, fullName: e.target.value}))} placeholder="Full Name" />
        <input type="text" className="input-form" onChange={(e) => setUser((prev) => ({...prev, username: e.target.value}))} placeholder="Username" />
        <input type="password" className="input-form" onChange={(e) => setUser((prev) => ({...prev, password: e.target.value}))} placeholder="Password" />
        <input type="password" className="input-form" onChange={(e) => setUser((prev) => ({...prev, passwordConfirmation: e.target.value}))} placeholder="Password Confirmation" />
        <FormControl component="fieldset">
          <FormLabel component="legend"></FormLabel>
          <RadioGroup
            aria-label="gender"
            name="gender"
            value={user.gender}
            onChange={(e) => setUser((prev) => ({...prev, gender: e.target.value}))}
            className='gap-20'
            row
          >
            <FormControlLabel value="male" control={<Radio />} label="Male" />
            <FormControlLabel value="female" control={<Radio />} label="Female" />
          </RadioGroup>
        </FormControl>
      </form>
      <button type="submit" className='btn btn-primary btn-md btn-wide'>Submit</button>
      <Link to={"/login"} className='text-xs'>Already have an account? <span className='text-blue-600 font-bold hover:text-blue-800'>login</span></Link>
    </div>
  );
};

export default Register;