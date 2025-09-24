import React from 'react';
import './App.css';
import 'semantic-ui-css/semantic.min.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {  Routes, Route, Navigate } from 'react-router-dom'; // Import Router, Routes, Route, and Navigate from react-router-dom
import SignIn from './views/Authentication/SignIn';
import Dashboard from './views/Dashboards/Dashboard';
import Tags from './views/tags/tags';

import SignUp from './views/Authentication/SignUp';
import Homepage from './views/Home/HomePage.js';
import { Container } from 'semantic-ui-react';
import { currentUser, logout } from './constants';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavigationMenu from './components/navbar.js';



const App = () => {
  return (
      <>
        <div className="App">
           
        <NavigationMenu />
        <ToastContainer/>
          <Routes>
            <Route path="/signup"  element={
              !currentUser() ?  <SignUp /> : <Navigate to="/dashboard" />
             } />
             <Route path="/signin"  element={
              !currentUser() ?  <SignIn /> : <Navigate to="/dashboard" />
             } />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/dashboard" element={currentUser() ? <Dashboard /> : <Navigate to="/signin" />} />
            <Route path="/" element={<Navigate to="/homepage" />} />
            <Route path="/tags" element={<Tags/>} />
            
          </Routes>
        </div>
      </>
      
    
  );
};
export default App;

