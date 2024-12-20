import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { passwordStrength } from "check-password-strength"; 
import { exportKey, generateUserKeys, storePrivateKey } from '../utils/UserKeys';
import { isValidUsername } from '../utils/util';

type registerUserDetails = {
  fullName: string;
  username: string;
  password: string;
  passwordConfirmation: string;
  publicKey: string;
}

type KeyPairResult = {
  exportedPublicKey: string;
  privateKey: CryptoKey;
}

const generateKeyPair = async (): Promise<KeyPairResult> => {
  try {
    const { publicKey, privateKey } = await generateUserKeys();
    const exportedPublicKey = await exportKey(publicKey, "public");

    sessionStorage.setItem("publicKey", exportedPublicKey);

    return { exportedPublicKey, privateKey };

  } catch (error) {
    console.error("Error in generating key pairs: ", error);
    throw error;
  }
}

const Register = () => {
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    username: "",
    password: "",
    passwordConfirmation: "",
    publicKey: "",
  });
  const [loading, setLoading] = useState(false);
  const { setUser, setAccessToken } = useAuthContext();

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userDetails.fullName || !userDetails.username || !userDetails.password || !userDetails.passwordConfirmation) {
      alert("Please fill in all fields");
      return;
    }

    const checkValidUsername = isValidUsername(userDetails.username);
    if (!(checkValidUsername.isValid)) {
      alert(checkValidUsername.message);
      return;
    }

    if (userDetails.password !== userDetails.passwordConfirmation) {
      alert("Password and Password Confirmation does not match");
      return;
    }

    if (passwordStrength(userDetails.password).value !== "Strong") {
      alert("Password must include lowercase, uppercase, symbol and number");
      return;
    }

    const { exportedPublicKey, privateKey } = await generateKeyPair();
    const updatedUserDetails = {...userDetails, publicKey: exportedPublicKey};

    const registerUser = async (userDetails: registerUserDetails) => {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/register", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(userDetails),
        }); 

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }
        
        setUser({id: data.user.id, username: data.user.username});
        setAccessToken(data.accessToken);
        storePrivateKey(privateKey, data.user.id);
        sessionStorage.setItem("userId", data.user.id);
      } catch (error: any) {
        console.error(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    registerUser(updatedUserDetails);
  }

  return (
    <div className="flex flex-col items-center bg-white w-[85vw] min-w-[352px] sm:max-w-lg md:max-w-2xl gap-4 rounded-3xl p-4 shadow-lg">
      <h1 className="text-3xl mt-3 font-bold">Register <span className='text-blue-600'>chatApp</span> </h1>
      <form className="flex flex-col items-center gap-2 w-full max-w-md" onSubmit={handleFormSubmission}>
        <input type="text" value={userDetails.fullName} className="input-form" onChange={(e) => setUserDetails({ ...userDetails, fullName: e.target.value })} placeholder="Full Name" />
        <input type="text" value={userDetails.username} className="input-form" onChange={(e) => setUserDetails({...userDetails, username: e.target.value})} placeholder="Username" />
        <input type="password" value={userDetails.password} className="input-form" onChange={(e) => setUserDetails({...userDetails, password: e.target.value})} placeholder="Password" />
        <input type="password" value={userDetails.passwordConfirmation} className="input-form" onChange={(e) => setUserDetails({...userDetails, passwordConfirmation: e.target.value})} placeholder="Password Confirmation" />
      </form>
      <button type="submit" onClick={handleFormSubmission} className='btn btn-primary btn-md btn-wide' disabled={loading}>{ loading ? "Loading..." : "Register" }</button>
      <Link to={"/login"} className='text-xs'>Already have an account? <span className='text-blue-600 font-bold hover:text-blue-800'>Login</span></Link>
    </div>
  );
};

export default Register;