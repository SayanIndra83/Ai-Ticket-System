import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function CheckAuth({children, protectedRoutes}) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token")
    
    if(protectedRoutes){
      if(!token){
        navigate("/login")
      }
      else{
        setLoading(false);

      }
    }
    else{
      if(token){
        navigate("/")
      }
      else setLoading(false)
    }
  }, [navigate, protectedRoutes])

  if(loading){
    return <div>loading...</div>
  }

  return children;
}

export default CheckAuth
