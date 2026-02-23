import {
  Button,
  Box,
  InputLabel,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import Divider from "@mui/material/Divider";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

export function LoginForm() {
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
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          gap: "5px",
        }}
      >
        <Box
          sx={{
            width: "48px",
            height: "36px",
            borderRadius: "15px",
            backgroundColor: blue[700],
            mx: "auto",
            mb: "10px",
          }}
        >
          <PrecisionManufacturingIcon sx={{ margin: "5px", color: "white" }} />
        </Box>

        <Typography variant={"h5"} sx={{ fontSize: "32", fontWeight: "bold" }}>
          Protein Designer!
        </Typography>
        <Typography sx={{ color: grey[600], fontSize: "16" }}>
          Design new proteins with AI quick and easily!
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box>
          <InputLabel sx={{ fontSize: "10pt" }}>Password</InputLabel>
          <TextField
            placeholder="name@institution.com"
            sx={{ width: "100%", mt: "6px" }}
          />
        </Box>
        <Box>
          <InputLabel sx={{ fontSize: "10pt" }}>Email</InputLabel>
          <TextField
            type="password"
            placeholder="••••••••"
            sx={{ width: "100%", mt: "6px" }}
          />
        </Box>
        <Button
          variant="contained"
          sx={{ height: "48px", width: "100%", borderRadius: "10px" }}
        >
          Log In
        </Button>
      </Box>

      <Divider sx={{ bgcolor: grey[50] }} />
      <Typography sx={{ mx: "auto", color: grey[600] }}>
        {"Don't have an account? "}
        <Link
          sx={{ color: blue[800], fontWeight: 500, textDecoration: "none" }}
          href="#"
        >
          Sign up
        </Link>
      </Typography>
    </Box>
  );
}
