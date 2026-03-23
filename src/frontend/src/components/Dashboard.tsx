import {
  Box,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import { type SvgIconProps, MenuItem, FormControl } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import Select from "@mui/material/Select";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useLocation, Link, useNavigate } from "react-router";
import { DashboardTheme } from "../themes/DashboardTheme";
import { JobStatus } from "../types/JobStatus";
import { supabase } from "../supabase"
import { useState, useEffect } from 'react'


interface DashboardLinkProps {
  labelText: string;
  linkTo: string;
  onClick?: () => void;
  children: React.ReactNode & SvgIconProps; // children that are MUI icons
}

interface DashboardSelectProps {
  labelText: string;
  options: string[];
}

/**
 * Temporary improvised type for the
 * purposes of making a shell for the
 * aesthetic quality
 */
type Job = {
  name: string;
  status: string;
  timeCreated: string;
  proteinTarget: string;
};
interface InnerTableProps {
  jobs: Job[];
}

function DashboardLink({ labelText, linkTo, children, onClick }: DashboardLinkProps) {
  const backgroundColor = location.pathname == linkTo ? grey[200] : "white";

  return (
    <Box
    onClick = {onClick}
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
      {onClick ? 
      (<Typography variant="h6" style = {{cursor: "pointer"}}>{labelText}</Typography>) :
      (
        <Link
        to={linkTo}
        style={{
          textDecoration: "None",
          color: "black",
        }}
      >
        <Typography variant="h6">{labelText}</Typography>
      </Link>
      )}
      </Box>
    </Box>
  );
}

function DashboardPanel() {
  const location = useLocation();
  const [name, setName] = useState("")
  useEffect(() => {
    const currentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if(!data.user){
        console.log("error with supabase returning a user, maybe session problem")
        return;
      }
      const res = await fetch(`http://localhost:4000/me/${data.user.id}`);
      if(!res){
        console.log("error fetching from our backend endpoint me")
        return;
      }
      const parsed = await res.json();
      if(!parsed){
        console.log("error parsing me response data");
      }
      setName(parsed.user.name);

    }
    currentUser();

  }, []);
  const navigate = useNavigate();
  const handleLogout = async () => {
    const {error} = await supabase.auth.signOut();
    if(error){
      console.log("There is an error signing out, check handleLogout in Dashboard.tsx");
      return;
    }
    console.log("Logout was successful.")
    navigate("/", { replace: true });
  };
  console.log("name" + " " + name);
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
        <Typography variant="h5" sx={{ fontSize: "14pt", marginTop: "20px"}}>
          Welcome, {name}
        </Typography>
      </Box>

      <Box sx={{ px: "12px" }}>
        <DashboardLink labelText="Dashboard" linkTo="/home">
          <SpaceDashboardOutlinedIcon />
        </DashboardLink>
        <DashboardLink labelText="New Design" linkTo="/create">
          <AddOutlinedIcon />
        </DashboardLink>
        <DashboardLink labelText="Settings" linkTo="/settings">
          <SettingsOutlinedIcon />
        </DashboardLink>
        <DashboardLink labelText="Log Out" onClick={handleLogout} linkTo="">
          <ExitToAppOutlinedIcon/>
        </DashboardLink>
      </Box>
    </Box>
  );
}

// To:Do needs onchange, and state association
function DashboardSelect({ labelText, options }: DashboardSelectProps) {
  return (
    <FormControl sx={{ mr: "12px" }}>
      <Select
        value={""}
        displayEmpty
        sx={{ width: "128px", maxHeight: "32px", bgcolor: grey[200] }}
        inputProps={{ "aria-label": "Without label" }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {options.map((val) => (
          <MenuItem value={val}>{val}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function InnerTable({ jobs }: InnerTableProps) {
  return (
    <TableContainer
      sx={{
        border: `1px solid ${grey[400]}`,
        borderRadius: "15px",
        minHeight: "407px",
        maxHeight: "600px",
      }}
    >
      <Table>
        <TableHead>
          <TableCell>Job Name</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Created</TableCell>
          <TableCell>Protein Target</TableCell>
        </TableHead>
        <TableBody>
          {jobs.map((job: Job, _: Number) => (
            <TableRow>
              <TableCell>{job.name}</TableCell>
              <TableCell
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {job.status}{" "}
                {(job.status.toLocaleLowerCase() === JobStatus.COMPLETED ||
                  job.status.toLocaleLowerCase() === JobStatus.FAILED) && (
                  <OpenInNewIcon
                    sx={{
                      height: "20px",
                      width: "20px",
                      color: "black",
                      ml: "4px",
                    }}
                  />
                )}
              </TableCell>
              <TableCell>{job.timeCreated}</TableCell>
              <TableCell>{job.proteinTarget}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {jobs.length === 0 && (
        <Typography
          variant="h6"
          sx={{ ml: "16px", mt: "6px", fontWeight: "normal" }}
        >
          No jobs found. Create a new one{" "}
          <Link
            style={{
              color: blue[800],
              fontWeight: 500,
              textDecoration: "none",
            }}
            to="/login"
          >
            here
          </Link>{" "}
        </Typography>
      )}
    </TableContainer>
  );
}

function DashboardTable() {
  const job: Job[] = [
    {
      name: "Job1",
      status: "Completed",
      timeCreated: "01/29/2026",
      proteinTarget: "ABCDED",
    },
    {
      name: "Job2",
      status: "Pending",
      timeCreated: "07/23/2021",
      proteinTarget: "DSDD",
    },
    {
      name: "Job3",
      status: "Missing",
      timeCreated: "05/01/2024",
      proteinTarget: "WEEEW",
    },
    {
      name: "Job4",
      status: "Failed",
      timeCreated: "11/12/2017",
      proteinTarget: "ATCG",
    },
    {
      name: "Job2",
      status: "Pending",
      timeCreated: "07/23/2021",
      proteinTarget: "DSDD",
    },
    {
      name: "Job3",
      status: "Missing",
      timeCreated: "05/01/2024",
      proteinTarget: "WEEEW",
    },
    {
      name: "Job4",
      status: "Failed",
      timeCreated: "11/12/2017",
      proteinTarget: "ATCG",
    },
    {
      name: "Job2",
      status: "Pending",
      timeCreated: "07/23/2021",
      proteinTarget: "DSDD",
    },
    {
      name: "Job3",
      status: "Missing",
      timeCreated: "05/01/2024",
      proteinTarget: "WEEEW",
    },
    {
      name: "Job4",
      status: "Failed",
      timeCreated: "11/12/2017",
      proteinTarget: "ATCG",
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant={"h1"} sx={{ fontSize: "32pt", my: "16px" }}>
        Jobs
      </Typography>
      <Box sx={{ mb: "20px" }}>
        <DashboardSelect labelText="Tester" options={["Test1", "Test2"]} />
        <DashboardSelect labelText="Tester" options={["Test1", "Test2"]} />
        <DashboardSelect labelText="Tester" options={["Test1", "Test2"]} />
      </Box>

      <InnerTable jobs={job} />
    </Box>
  );
}

export function Dashboard() {
  return (
    <ThemeProvider theme={DashboardTheme}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "space-between",
          px: "24px",
          gap: "48px",
        }}
      >
        <DashboardPanel />
        <DashboardTable />
      </Box>
    </ThemeProvider>
  );
}
