import { Box } from "@mui/material";
import {useState} from "react"
import { FormTextField } from "./FormComponents/FormTextField";
import { FormSubmitButton } from "./FormComponents/FormSubmitButton";
import { FormHeader } from "./FormComponents/FormHeader";
import { FormFooter } from "./FormComponents/FormFooter";
import {useNavigate} from 'react-router-dom'

export function SignUpForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate();

  async function handleSignUp() {
    console.log("name, email, password", {name, email, password})
    try{
      const res = await fetch("http://localhost:4000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        }),
        credentials: "include"
      });
      const user_data = await res.json();
      if(!res.ok){
        console.log("signup failed")
        if(user_data.message){
          throw new Error(user_data.message + "this is what is wrong")
        }
        else{
          throw new Error("error while signing up likely backend problem, user data is null");
        }
      }
      console.log("signup was a success")
      navigate("/home", {
        state: {name: user_data.name}
      })
    }
    catch(e){
      console.log(e);
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
        TopText="Create your account"
        BottomText="Enter your details to get started with Protein Designer!"
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <FormTextField
          labelText="Full Name"
          placeholder="Enter your full name"
          isPassword={false}
          value = {name}
          onChange = {(e) => {
            setName(e.target.value)
            console.log("typing name", e.target.value)

          }
        }
        />
        <FormTextField
          labelText="Email"
          placeholder="name@institution.com"
          isPassword={false}
          value = {email}
          onChange = {(e) => {
            setEmail(e.target.value)
            console.log("typing email", e.target.value)
          }}
        />
        <FormTextField
          labelText="Password"
          placeholder="•••••••• (Minimum 8 characters)"
          isPassword={true}
          value = {password}
          onChange = {(e) => {
            setPassword(e.target.value)
            console.log("password", e.target.value)
          }}
        />
        <FormSubmitButton
          ButtonText="Sign up"
          OnClick={() => {
            console.log("clicked the sign up");
            handleSignUp()
          }}
        />
      </Box>

      <FormFooter askToSignUp={false} />
    </Box>
  );
}
