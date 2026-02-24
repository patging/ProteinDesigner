import { LoginForm } from "./components/LoginForm";
import { Box } from "@mui/material";

function App() {
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <LoginForm />
      </Box>
    </Box>
  );
}

export default App;
