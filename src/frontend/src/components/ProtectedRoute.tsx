import { Navigate } from "react-router"
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase"


type ProtectedRouteProp = {
    children: React.ReactNode
};

export function ProtectedRoute({ children }: ProtectedRouteProp){
    const [hasSession, setSession] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkSession(){
            const {data, error} = await supabase.auth.getSession();
            if(error){
                console.log("error with the supabase session:", error.message)
                setSession(false);
            }
            else{
                if(!data.session){
                    setSession(false);
                }
                else{
                    console.log("supabase session is good")
                    setSession(true);
                }
            }
        }
        checkSession();
    }, [])
    
    if(hasSession == false){
        return <Navigate to="/" replace />
    }
    else if(hasSession == true){
        return(
            <>
        {children}
        </>
        )

    }
}