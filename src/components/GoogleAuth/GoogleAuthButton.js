import React from 'react'
import { Button, Icon } from 'semantic-ui-react'
import { GoogleLogin,useGoogleLogin,useGoogleOneTapLogin,  } from '@react-oauth/google';
import { BACKEND_URL, currentUser } from '../../constants';
import {  toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function GoogleAuthButton(props) {
   
    


    const login = async ()=>{
        const resp = await fetch(`${BACKEND_URL}/users/auth/google?mode=${props?.mode}&userId=${currentUser()?._id}&frontendPath=${window.location.pathname}`)
        const data = await resp.json()
        const {authUrl} = data
         window.open(decodeURI(authUrl), 'popup', 'width=600,height=600')
        window.addEventListener('message', async (event) => {
            const { type, data } = event.data;
            console.log(event.data)
            if (type === 'auth_success') {
            

                console.log('Authentication successful:', data);
                if(data._id){ // successfull login
                    localStorage['EmailOrganizerCurrentUser'] = JSON.stringify(data)
                    toast.dismiss();    
                    toast.success(props.mode === 'login' ? `Welcome ${currentUser()?.email}!`: `Your account was successfully connected `, {
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


                }else{ // there was an error
                    console.log(data)
                }
               
              
             }
        })

    }
  return (
    <>
        <Button
             
            color={props.color}

            onClick={
                ()=> {
                    !props.disabled && login()
                }
                        
            }
        >
            <Icon name={props.icon} />

            {props.text}
        </Button>
    </>
  )
}
