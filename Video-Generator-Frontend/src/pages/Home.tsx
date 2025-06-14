import { Navbar } from '../components/navbar';
import { HeroSection } from '../components/hero-section';
import { FeaturesSection } from '../components/features-section';
import { DemoSection } from '../components/demo-section';
import { CtaSection } from '../components/cta-section';
import { Footer } from '../components/footer';
import { useGoogleLogin, googleLogout  } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
const BACKEND_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL || 'http://localhost:8000';
export function Home() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async tokenResponse => {
      console.log("Login Success", tokenResponse);
      const userInfo : any = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        }
      });
      if(userInfo !== undefined) {
        console.log("User Info: ", userInfo.data)
        const login : any = await axios.post(`${BACKEND_URL}/api/users/login`, {
          "name" : userInfo.data.name,
          "email" : userInfo.data.email,
          "isGoogleUser" : true
        })
        if(login.data.success === true) {
          const name = login.data.message.name;
          const email = login.data.message.email;
          const userId = login.data.message.userId;
          localStorage.setItem("userId", userId);
          localStorage.setItem("name", name);
          localStorage.setItem("email", email);
          navigate("/maven");
        } else {
          alert("Login Unsuccessfull")
        }
      }
    },
    onError: () => {
      console.log("Login Failed");  
    },
  })
  
  const logOut = () => {
    console.log("Logged Out")
    googleLogout();
    localStorage.removeItem("userId");
    setLoggedIn(false);
  }

  const isLoggedIn = async() =>{
    const userId = localStorage.getItem("userId");
    console.log(userId)
    if(userId !== null) {
      setLoggedIn(true)
    }
  }
  useEffect(()=>{
    isLoggedIn();
  },[loggedIn])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar loggedIn = {loggedIn} loginWithGoogle = {loginWithGoogle} logOut = {logOut}/>
      <main>
        <HeroSection loggedIn  = {loggedIn} loginWithGoogle = {loginWithGoogle}/>
        <FeaturesSection />
        <DemoSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}