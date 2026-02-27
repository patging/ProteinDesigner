import { createTheme } from "@mui/material";
import "../App.css";

export const SignUpLogInTheme = createTheme({
  typography: {
    // Note the capital 'S'
    fontFamily: ["Inter", "sans-serif"].join(","),
    fontWeightRegular: 400,
    fontWeightMedium: 500,
  },
});
