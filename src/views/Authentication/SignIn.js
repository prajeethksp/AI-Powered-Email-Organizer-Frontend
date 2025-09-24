import React, { useState } from 'react';
import { NotificationManager } from 'react-notifications';
import { useNavigate } from 'react-router-dom';
import GoogleAuthButton from '../../components/GoogleAuth/GoogleAuthButton';
import { BACKEND_URL, currentUser } from '../../constants';
import './SignIn.css'; // Import CSS for styling
import {  toast, Bounce } from 'react-toastify';
const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('')
  const [errorMessages, seterrorMessages] = useState([])
  const navigate = useNavigate();
  

  const handleSubmit = (event) => {
    console.log('signin')
    event.preventDefault()
      signInUser()

  };

  const signInUser = async ()=> {
    const resp = await fetch(`${BACKEND_URL}/users/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',

      },
      body: JSON.stringify({
        email: email,
        password: password
      }),

    })
    const data = await resp.json()
    if(data._id){ // User was successfully authenticated
      console.log(data)
      localStorage['EmailOrganizerCurrentUser'] = JSON.stringify(data)
      toast.dismiss();    
      toast.success(`Welcome back ${currentUser()?.email}!`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
          onOpen: () => setTimeout(() => {
              window.location.pathname = '/dashboard';
              }, 2500)
          });
     
    }else{ // Error
      setError(data.error)
      seterrorMessages(data.errorMessages)
      
    }

  }

  return (
    
    <div className="signin-container">
       
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" className="button-spacing">Sign In</button>
        <GoogleAuthButton
          disabled = {false} 
          icon="google plus official"
          color="google plus"
          text={'Sign in with Google'}
          mode={'login'}
        />
        
      </form>
      <br/>
      Don't have an account ? <a href='/signup'>Sign Up</a>

    </div>
  );
};

export default SignIn;



