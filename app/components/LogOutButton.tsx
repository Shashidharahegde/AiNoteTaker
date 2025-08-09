"use client";

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'; 
import React from 'react'
import { ToastContainer, toast } from 'react-toastify';
import Router, { useRouter } from 'next/navigation';


function LogOutButton() {
    const [loading, setLoading] = React.useState(false);
    const router = useRouter();
    const handleLogOut = async () => {
        console.log("Logging out...");
        setLoading(true)

        try {
          await new Promise((resolve)=> setTimeout(resolve, 2000))
         toast.success("Logged out successfully");
        }
        
        catch(err){
          console.log(err)
          const notify = () => toast("erorr has occured");
        }
        finally {
          setLoading(false)
          router.push("/login")
        }

    }
  return (

        <Button className='w-22'
            onClick={handleLogOut}
            disabled={loading}>
           {loading ? <Loader2 className="mr-2 h-4 w-14 animate-spin" /> : "Log Out"}  
            <ToastContainer position="top-right" autoClose={3000} />
        </Button>

  )
}

export default LogOutButton