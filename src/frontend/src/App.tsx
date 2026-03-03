import { AppRouter } from "./components/AppRouter";
import { Box } from "@mui/material";

function App() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <AppRouter />
    </Box>
  );
}

export default App;
