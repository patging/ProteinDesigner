import { Box, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { type SvgIconProps } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import { useLocation, Link } from "react-router";

import { DashboardTheme } from "../themes/DashboardTheme";

interface DashboardLinkProps {
  labelText: string;
  linkTo: string;
  children: React.ReactNode & SvgIconProps; // children that are MUI icons
}

function DashboardLink({ labelText, linkTo, children }: DashboardLinkProps) {
  const location = useLocation();
  const backgroundColor = location.pathname == linkTo ? grey[200] : "white";

  return (
    <Box
      sx={{
        width: "288px",
        height: "60px",
        backgroundColor: { backgroundColor },
        display: "flex",
        alignItems: "center",
      }}
    >
      {children}
      <Box
        sx={{
          ml: "12px",
        }}
      >
        <Link
          to={linkTo}
          style={{
            textDecoration: "None",
            color: "black",
          }}
        >
          <Typography variant="h6">{labelText}</Typography>
        </Link>
      </Box>
    </Box>
  );
}

function DashboardPanel() {
  return (
    <Box
      sx={{
        width: "300px",
        minHeight: "500px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        px: "16px",
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontSize: "14pt" }}>
          Protein Designer
        </Typography>
        <Typography variant="h6" sx={{ fontSize: "12pt", color: grey[600] }}>
          AI-powered protein design
        </Typography>
      </Box>

      <Box sx={{ px: "12px" }}>
        <DashboardLink labelText="Dashboard" linkTo="/home">
          <SpaceDashboardOutlinedIcon />
        </DashboardLink>
        <DashboardLink labelText="New Design" linkTo="/signup">
          <AddOutlinedIcon />
        </DashboardLink>
        <DashboardLink labelText="Settings" linkTo="/signup">
          <SettingsOutlinedIcon />
        </DashboardLink>
        <DashboardLink labelText="Log Out" linkTo="/signup">
          <ExitToAppOutlinedIcon />
        </DashboardLink>
      </Box>
    </Box>
  );
}

export function Dashboard() {
  return (
    <ThemeProvider theme={DashboardTheme}>
      <DashboardPanel />
    </ThemeProvider>
  );
}
