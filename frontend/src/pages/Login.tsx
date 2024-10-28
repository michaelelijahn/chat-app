import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { isValidUsername } from '../utils/util';
import { exportKey, generateUserKeys, getUserPrivateKey, storePrivateKey } from '../utils/UserKeys';

const Login = () => {
  const [userDetails, setUserDetails] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { setUser, setAccessToken } = useAuthContext();

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userDetails.username || !userDetails.password) {
      alert("Please fill in all fields");
      return;
    }

    const checkValidUsername = isValidUsername(userDetails.username);
    if (!(checkValidUsername.isValid)) {
      alert(checkValidUsername.message);
      return;
    }

    const loginUser = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userDetails),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        const existingPrivateKey = await getUserPrivateKey(data.user.id);

        if (!existingPrivateKey) {
          // this part is still wrong, i want to change it
          const { publicKey, privateKey } = await generateUserKeys();
          const exportedPublicKey = await exportKey(publicKey, "public");

          const result = await fetch("/api/auth/updatePublicKey", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${data.accessToken}`
            },
            body: JSON.stringify({ publicKey: exportedPublicKey}),
          });

          if (!result.ok) {
            throw new Error("Failed to update public key");
          }

          await storePrivateKey(privateKey, data.user.id);
          data.user.publicKey = exportedPublicKey;
        }

        setUser(data.user);
        setAccessToken(data.accessToken);
        sessionStorage.setItem("username", data.user.username);
        sessionStorage.setItem("fullName", data.user.fullName);
        sessionStorage.setItem("publicKey", data.user.publicKey);
        
      } catch (error: any) {
        console.log(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    loginUser();
  }

  return (
    <div className="flex flex-col items-center bg-white w-[85vw] min-w-[352px] sm:max-w-lg md:max-w-2xl gap-4 rounded-3xl p-4 shadow-lg">
      <h1 className="text-3xl mt-3 font-bold">Login <span className='text-blue-600'>chatApp</span> </h1>
      <form className="flex flex-col items-center gap-2 w-full max-w-md" onSubmit={handleFormSubmission}>
        <input type="text" className="input-form" onChange={(e) => setUserDetails((prev) => ({...prev, username: e.target.value}))} placeholder="Username" />
        <input type="password" className="input-form" onChange={(e) => setUserDetails((prev) => ({...prev, password: e.target.value}))} placeholder="Password" />
      </form>
      <button type="submit" className='btn btn-primary btn-md btn-wide mb-4' onClick={handleFormSubmission} disabled={loading}>{ loading ? "Loading..." : "Login" }</button>
      <Link to={"/register"} className='text-xs'>Haven't registered? <span className='text-blue-600 font-bold hover:text-blue-800'>Register</span></Link>
    </div>
  );
};

export default Login;