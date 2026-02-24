import { Divider, Typography } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import { Link } from "react-router";

type FormFooterProps = {
  askToSignUp: boolean;
};

export function FormFooter({ askToSignUp }: FormFooterProps) {
  return (
    <>
      <Divider sx={{ bgcolor: grey[50] }} />
      <Typography sx={{ mx: "auto", color: grey[600] }}>
        {askToSignUp ? "Don't have an account? " : "Already have an account? "}

        <Link
          style={{ color: blue[800], fontWeight: 500, textDecoration: "none" }}
          to={askToSignUp ? "/signup" : "/login"}
        >
          {askToSignUp ? "Sign up" : "Log In"}
        </Link>
      </Typography>
    </>
  );
}
