import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { type SvgIconProps } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { Viewer } from "@e-infra/react-molstar-wrapper";
import type { Protein } from "@e-infra/react-molstar-wrapper";
import "@e-infra/react-molstar-wrapper/style.css";
import { useLocation, Link, useNavigate } from "react-router";
import { DashboardTheme } from "../themes/DashboardTheme";
import { supabase } from "../supabase";

// Helper function to get user session from localStorage
type StoredUser = {
  id: string;
  name?: string;
  email?: string;
};

function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem("pd_user");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

// COPIED FROM Dashboard.tsx 26:31
interface DashboardLinkProps {
  labelText: string;
  linkTo: string;
  onClick?: () => void;
  children: React.ReactNode & SvgIconProps; // children that are MUI icons
}

interface JobFormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
}

interface JobFormContentProps {
  pdbFile: File | null;
  onFileChange: (file: File | null) => void;
}

// COPIED FROM Dashboard.tsx 53:90
function DashboardLink({
  labelText,
  linkTo,
  children,
  onClick,
}: DashboardLinkProps) {
  const backgroundColor = location.pathname == linkTo ? grey[200] : "white";

  return (
    <Box
      onClick={onClick}
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
        {onClick ? (
          <Typography variant="h6" style={{ cursor: "pointer" }}>
            {labelText}
          </Typography>
        ) : (
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

// COPIED FROM Dashboard.tsx 92:145
function DashboardPanel() {
  const location = useLocation();
  const name = location.state?.name;
  const navigate = useNavigate();
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(
        "There is an error signing out, check handleLogout in Dashboard.tsx",
      );
      return;
    }
    console.log("Logout was successful.");
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
        <Typography variant="h5" sx={{ fontSize: "14pt", marginTop: "20px" }}>
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
        <DashboardLink labelText="Settings" linkTo="">
          <SettingsOutlinedIcon />
        </DashboardLink>
        <DashboardLink labelText="Log Out" onClick={handleLogout} linkTo="">
          <ExitToAppOutlinedIcon />
        </DashboardLink>
      </Box>
    </Box>
  );
}

function JobFormField({
  label,
  placeholder,
  value,
  onChange,
  helperText,
}: JobFormFieldProps) {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontSize: "12pt", mb: "8px" }}>
        {label}
      </Typography>
      <TextField
        fullWidth
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        helperText={helperText}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        }}
      />
    </Box>
  );
}

function JobFormContent({ pdbFile, onFileChange }: JobFormContentProps) {
  const [jobName, setJobName] = useState("");
  const [contig, setContig] = useState("");
  const [numberDesigns, setNumberDesigns] = useState("1");
  const [timesteps, setTimesteps] = useState("10");
  const [stepScale, setStepScale] = useState("1.5");

  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setJobId(null);

    if (!pdbFile) {
      setError("Please select a .pdb file.");
      return;
    }
    // TODO: Add a contig check that looks into the PDB file to ensure the user puts correct info (based on residue numbers, length, etc.)
    if (!contig.trim()) {
      setError("Contig is required.");
      return;
    }
    // TODO: check for integer input + consider other edge cases with the params below (consult the neurosnap API docs)
    if (
      numberDesigns.trim() === "" ||
      isNaN(Number(numberDesigns)) ||
      Number(numberDesigns) < 1
    ) {
      setError("Number of Designs must be a positive integer.");
      return;
    }
    if (
      timesteps.trim() === "" ||
      isNaN(Number(timesteps)) ||
      Number(timesteps) < 10
    ) {
      setError("Timesteps must be a number greater than or equal to 10.");
      return;
    }
    if (
      stepScale.trim() === "" ||
      isNaN(Number(stepScale)) ||
      Number(stepScale) <= 0
    ) {
      setError("Step Scale must be a positive number.");
      return;
    }

    setLoading(true);
    try {
      const user = getStoredUser(); // get user session from localStorage
      if (!user?.id) {
        throw new Error("User session not found. Please log in again.");
      }

      const formData = new FormData();
      formData.append("pdbFile", pdbFile);
      formData.append("userId", user.id);
      formData.append("contig", contig);
      formData.append("numberDesigns", numberDesigns);
      formData.append("timesteps", timesteps);
      formData.append("stepScale", stepScale);

      const res = await fetch(`http://localhost:4000/api/submit-rfdiffusion3`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || res.statusText);

      setJobId(String(data.jobId));
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <Typography variant="h1" sx={{ fontSize: "32pt", mt: "16px" }}>
        Create New Design
      </Typography>

      {/* Job Name */}
      <JobFormField
        label="Job Name"
        placeholder="Enter job name"
        value={jobName}
        onChange={(e) => setJobName(e.target.value)}
      />

      {/* PDB File Upload */}
      <Box>
        <Typography variant="h6" sx={{ fontSize: "12pt", mb: "8px" }}>
          Input Protein
        </Typography>
        <Button
          component="label"
          variant="outlined"
          startIcon={<UploadFileOutlinedIcon />}
          fullWidth
          sx={{
            textTransform: "none",
            borderStyle: "dashed",
            borderRadius: "8px",
            justifyContent: "flex-start",
            py: "14px",
            color: pdbFile ? "text.primary" : "text.secondary",
          }}
        >
          {pdbFile ? pdbFile.name : "Upload PDB file"}
          <input
            type="file"
            accept=".pdb"
            hidden
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </Button>
      </Box>

      {/* Contig */}
      <JobFormField
        label="Contig"
        placeholder="e.g. 40-120,E6-155"
        value={contig}
        onChange={(e) => setContig(e.target.value)}
        helperText="Motif segment + inpaint segment, e.g. 40-120,E6-155"
      />

      {/* Design Parameters */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
        }}
      >
        {/* Number of Designs */}
        <Box>
          <Typography variant="h6" sx={{ fontSize: "12pt", mb: "8px" }}>
            Number of Designs
          </Typography>
          <TextField
            fullWidth
            type="number"
            inputProps={{ min: 1 }}
            value={numberDesigns}
            onChange={(e) => setNumberDesigns(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        </Box>

        {/* Timesteps */}
        <Box>
          <Typography variant="h6" sx={{ fontSize: "12pt", mb: "8px" }}>
            Timesteps
          </Typography>
          <TextField
            fullWidth
            type="number"
            inputProps={{ min: 10 }}
            value={timesteps}
            onChange={(e) => setTimesteps(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        </Box>

        {/* Step Scale */}
        <Box>
          <Typography variant="h6" sx={{ fontSize: "12pt", mb: "8px" }}>
            Step Scale
          </Typography>
          <TextField
            fullWidth
            type="number"
            inputProps={{ min: 0, step: 0.1 }}
            value={stepScale}
            onChange={(e) => setStepScale(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        </Box>
      </Box>

      {/* Status messages */}
      {error && <Alert severity="error">{error}</Alert>}
      {jobId && (
        <Alert severity="success">
          Job submitted! ID: <strong>{jobId}</strong>
        </Alert>
      )}

      {/* Submit Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="button"
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SendOutlinedIcon />
            )
          }
          sx={{
            textTransform: "none",
            px: "28px",
            py: "10px",
            fontSize: "14pt",
          }}
        >
          {loading ? "Submitting…" : "Run Job"}
        </Button>
      </Box>
    </Box>
  );
}

export function JobForm() {
  const [pdbFile, setPdbFile] = useState<File | null>(null);
  const protein: Protein | undefined = pdbFile ? { file: pdbFile } : undefined;

  return (
    <ThemeProvider theme={DashboardTheme}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          px: "24px",
          gap: "48px",
        }}
      >
        {/* Left: nav sidebar */}
        <DashboardPanel />

        {/* Right: form + viewer side by side */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            gap: "40px",
            alignItems: "flex-start",
            minWidth: 0, // prevents flex children from overflowing
          }}
        >
          {/* Form column */}
          <Box sx={{ width: "500px", flexShrink: 0 }}>
            <JobFormContent pdbFile={pdbFile} onFileChange={setPdbFile} />
          </Box>

          {/* Viewer column - opens once file is uploaded */}
          {protein && (
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                pt: "80px", // aligns viewer roughly with the form fields
              }}
            >
              <Typography variant="h6" sx={{ fontSize: "12pt", mb: "8px" }}>
                Input Protein Structure Preview
              </Typography>
              <Viewer proteins={[protein]} height={500} />
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
