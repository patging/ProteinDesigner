import { Box } from "@mui/material";
import {useState} from "react";

import { FormTextField } from "./FormComponents/FormTextField";
import { FormSubmitButton } from "./FormComponents/FormSubmitButton";
import { FormHeader } from "./FormComponents/FormHeader";
import { FormFooter } from "./FormComponents/FormFooter";
import { useNavigate } from "react-router-dom";
export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [success, setSuccess] = useState<boolean | null>(null);
  const navigate = useNavigate();
  async function handleLogin() {
    setSuccess(null);
    try{
      const res = await fetch("http://localhost:4000/login", {
        method : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({email, password})
      })
      const login_response = await res.json()
      if(!res.ok){
        console.log("eroor with handleLogin")
        setSuccess(false);
        throw new Error(login_response.message || "problem with login");
      }
      else{
        console.log("login was a success")
        setSuccess(true)
        navigate("/home", {
          state: {name: login_response.name}
        })
      }
    }
    catch(e){
      console.log(e);
      setSuccess(false);
    }
  }

  return (
    <Box
      sx={{
        width: 448,
        height: 600,
        display: "flex",
        flexDirection: "column",
        gap: "40px",
      }}
    >
      
      <FormHeader
        TopText="Protein Designer"
        BottomText="Design new proteins with AI quick and easy!"
      />

{success == false && <h3 style = {{backgroundColor: "red", fontSize: "20px", color: "white", display: "flex", justifyContent: "center",}}>Invalid Username or Password</h3>}
{success == true && <h3 style = {{backgroundColor: "green", fontSize: "20px", color: "white", display: "flex", justifyContent: "center"}}>Logged In</h3>}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <FormTextField
          labelText="Email"
          placeholder="name@institution.com"
          isPassword={false}
          value = {email}
          onChange = {(e) => {
            setEmail(e.target.value);
            console.log("email change", e.target.value)
          }}
        />
        <FormTextField
          labelText="Password"
          placeholder="••••••••"
          isPassword={true}
          value = {password}
          onChange = {(e) => 
            {
              setPassword(e.target.value)
              console.log("typing password", e.target.value)
          }
          }
        />
        <FormSubmitButton
          ButtonText="Log In"
          OnClick={() => {
            console.log("clicked the login");
            handleLogin();
          }}
        />
      </Box>

      <FormFooter askToSignUp={true} />
    </Box>
  );
}
