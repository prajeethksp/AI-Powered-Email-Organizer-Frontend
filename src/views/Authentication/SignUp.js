import React, { useState } from 'react';
import { NotificationManager } from 'react-notifications';
import { useNavigate } from 'react-router-dom';
import {  toast, Bounce } from 'react-toastify';

import GoogleAuthButton from '../../components/GoogleAuth/GoogleAuthButton';
import { BACKEND_URL, currentUser } from '../../constants';
import './SignUp.css'; // Import CSS for styling

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('')
  const [errorMessages, seterrorMessages] = useState([])
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }else{
      signUpUser()
    }
    console.log('Signing up with:', { email, password });
    // Example: Handle sign-up logic (replace with actual API call)
  };

  const signUpUser = async ()=> {
    const resp = await fetch(`${BACKEND_URL}/users/signup`, {
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
      localStorage['EmailOrganizerCurrentUser'] = JSON.stringify(data)
      toast.dismiss();    
      toast.success(`Welcome ${currentUser()?.email}!`, {
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
    <div className="signup-container">
      <div className="signup-form">
      
        <h2>Create Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="btn-primary-wrapper">
            <button type="submit" className="btn-primary">Sign Up</button>
          </div>
          
            <div className="google-button-wrapper">
              <GoogleAuthButton
                className="google-button"
                disabled={false}
                icon="google plus official"
                color="google plus"
                text="Sign up with Google"
                mode="login"
              />
            </div>

        </form> 
        <p>Already have an account? <a href="/signin">Sign In</a></p>
      </div>
    </div>
  );
};

export default SignUp;
