import { Box } from "@mui/material";

import { FormTextField } from "./FormComponents/FormTextField";
import { FormSubmitButton } from "./FormComponents/FormSubmitButton";
import { FormHeader } from "./FormComponents/FormHeader";
import { FormFooter } from "./FormComponents/FormFooter";

export function SignUpForm() {
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
        />
        <FormTextField
          labelText="Email"
          placeholder="name@institution.com"
          isPassword={false}
        />
        <FormTextField
          labelText="Password"
          placeholder="••••••••"
          isPassword={true}
        />
        <FormSubmitButton
          ButtonText="Log In"
          OnClick={() => {
            console.log("clicked the sign up");
          }}
        />
      </Box>

      <FormFooter askToSignUp={false} />
    </Box>
  );
}
