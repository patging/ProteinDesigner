import { useParams, useNavigate } from "react-router";
import { Box, Typography, Button } from "@mui/material";
import { grey } from "@mui/material/colors";
import { ThemeProvider } from "@mui/material/styles";
import { DashboardTheme } from "../themes/DashboardTheme";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export function JobResults() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/home");
  };

  return (
    <ThemeProvider theme={DashboardTheme}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          px: "24px",
          py: "24px",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{
            mb: "24px",
            textTransform: "none",
            color: grey[700],
          }}
        >
          Back to Dashboard
        </Button>

        <Typography variant="h1" sx={{ fontSize: "32pt", mb: "16px" }}>
          Job Results
        </Typography>

        <Box
          sx={{
            border: `1px solid ${grey[400]}`,
            borderRadius: "8px",
            p: "24px",
            minHeight: "400px",
          }}
        >
          <Typography variant="h6" sx={{ mb: "16px", color: grey[600] }}>
            Job ID: {jobId}
          </Typography>

          <Typography variant="body1" sx={{ color: grey[700] }}>
            Job results page is currently under development. 
            <br />
            <br />
            This page will display detailed results and analysis for job{" "}
            <strong>{jobId}</strong>.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
