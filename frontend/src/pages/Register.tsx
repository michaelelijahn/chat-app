import { useState } from 'react';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

type registerUserDetails = {
  fullName: string;
  username: string;
  password: string;
  passwordConfirmation: string;
  gender: string;
}

const Register = () => {
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    username: "",
    password: "",
    passwordConfirmation: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthContext();

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(userDetails);
    // api
    const registerUser = async (userDetails: registerUserDetails) => {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(userDetails),
        }); 

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setUser(data);
      } catch (error: any) {
        console.error(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    registerUser(userDetails);
  }

  return (
    <div className="flex flex-col items-center bg-white w-[85vw] min-w-[352px] sm:max-w-lg md:max-w-2xl gap-4 rounded-3xl p-4 shadow-lg">
      <h1 className="text-3xl mt-3 font-bold">Register <span className='text-blue-600'>chatApp</span> </h1>
      <form className="flex flex-col items-center gap-2 w-full max-w-md" onSubmit={handleFormSubmission}>
        <input type="text" value={userDetails.fullName} className="input-form" onChange={(e) => setUserDetails({ ...userDetails, fullName: e.target.value })} placeholder="Full Name" />
        <input type="text" value={userDetails.username} className="input-form" onChange={(e) => setUserDetails({...userDetails, username: e.target.value})} placeholder="Username" />
        <input type="password" value={userDetails.password} className="input-form" onChange={(e) => setUserDetails({...userDetails, password: e.target.value})} placeholder="Password" />
        <input type="password" value={userDetails.passwordConfirmation} className="input-form" onChange={(e) => setUserDetails({...userDetails, passwordConfirmation: e.target.value})} placeholder="Password Confirmation" />
        <FormControl component="fieldset">
          <FormLabel component="legend"></FormLabel>
          <RadioGroup
            aria-label="gender"
            name="gender"
            value={userDetails.gender}
            onChange={(e) => setUserDetails({...userDetails, gender: e.target.value})}
            className='gap-20'
            row
          >
            <FormControlLabel value="male" control={<Radio />} label="Male" />
            <FormControlLabel value="female" control={<Radio />} label="Female" />
          </RadioGroup>
        </FormControl>
      </form>
      <button type="submit" onClick={handleFormSubmission} className='btn btn-primary btn-md btn-wide' disabled={loading}>{ loading ? "Loading..." : "Register" }</button>
      <Link to={"/login"} className='text-xs'>Already have an account? <span className='text-blue-600 font-bold hover:text-blue-800'>login</span></Link>
    </div>
  );
};

export default Register;