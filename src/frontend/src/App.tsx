import { LoginForm } from "./components/LoginForm";
import { Box } from "@mui/material";

function App() {
  return (
    <Box sx={{ width: "900px", height: "900px" }}>
      <Box sx={{ mx: "300px" }}>
        <LoginForm />
      </Box>
    </Box>
  );
}

export default App;
