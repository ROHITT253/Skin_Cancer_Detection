import { collection, getDocs } from 'firebase/firestore';
import React,{ useEffect, useState } from 'react'
import { InfinitySpin } from 'react-loader-spinner';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/init-firebase';

const Profilepage = () => {
  const { currentUser } = useAuth()
  const [isDoctor,setIsDoctor]=useState(null)


    useEffect(() => {
        if (currentUser && currentUser !== "not found") {
            getDocs(collection(db, "users")).then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().email === currentUser.providerData[0].email) {
                setIsDoctor(doc.data().userType);
                }
            });
            });
        }
    }, [currentUser]);
  return (
    <>
        {currentUser && isDoctor==="Doctor" ? <Redirect to='/doctor'/> : currentUser && isDoctor==="Patient" ? <Redirect to='/patient'/> : 
        <div style={{minHeight: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center"}}>
            <InfinitySpin color="#B83280" />
        </div>
        
        }
    </>
  )
}

export default Profilepage
