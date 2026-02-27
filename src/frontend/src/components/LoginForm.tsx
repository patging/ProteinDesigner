import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

import { FormTextField } from "./FormComponents/FormTextField";
import { FormSubmitButton } from "./FormComponents/FormSubmitButton";
import { FormHeader } from "./FormComponents/FormHeader";
import { FormFooter } from "./FormComponents/FormFooter";
import { SignUpLogInTheme } from "../themes/SignUpLogInTheme";

export function LoginForm() {
  return (
    <ThemeProvider theme={SignUpLogInTheme}>
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

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
              console.log("clicked the login");
            }}
          />
        </Box>

        <FormFooter askToSignUp={true} />
      </Box>
    </ThemeProvider>
  );
}
