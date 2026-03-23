import {supabase} from '../supabase'
import {useState, useEffect} from 'react'
import {
    Box,
    Typography
  } from "@mui/material";
import {DashboardPanel} from './Dashboard'


export function Settings() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [id, setId] = useState("")

    useEffect(() => {
        const currentUser = async () => {
            const { data } = await supabase.auth.getUser()
            if(!data.user){
                console.log("error fetching user from db");
                return;
            }
            setId(data.user.id);
            setEmail(data.user.email || "");
            const res = await fetch(`http://localhost:4000/me/${data.user.id}`)
            const parsed = await res.json();
            if(!parsed){
                console.log("error fetching from backend")
                return;
            }
            setName(parsed.user.name);
        }
        currentUser();

    }, [])
        return(
            <div style = {{display: "flex", height: "100vh", margin: "0"}}>
            <DashboardPanel/>
        <div style = {{display: "flex", flexDirection: "column", gap: "35px", backgroundColor: "lightgray", fontFamily: "monospace", padding: "20px", flex: "1" }}>
            <h1>Welcome To Protein Designer Settings Page</h1>
        <Typography variant="h5" sx={{ fontSize: "14pt" }}>
          Name: {name}
        </Typography>
        <Typography variant="h5" sx={{ fontSize: "14pt" }}>
          Email: {email}
        </Typography>
        <Typography variant="h5" sx={{ fontSize: "14pt" }}>
          ID: {id}
        </Typography>
        </div>
        </div>
        )


}