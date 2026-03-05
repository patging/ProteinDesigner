import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

export function TestNeurosnapAPI() {
  const [pdbFile, setPdbFile] = useState<File | null>(null); // Store the selected .pdb file??
  const [contig, setContig] = useState("");
  const [numberDesigns, setNumberDesigns] = useState("1");
  const [timesteps, setTimesteps] = useState("10");
  const [stepScale, setStepScale] = useState("1.5");

  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle job submission by sending data to backend endpoint, which proxies to Neurosnap API
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setJobId(null);

    if (!pdbFile) {
      setError("Please select a .pdb file.");
      return;
    }
    if (!contig.trim()) {
      setError("Contig is required.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("pdbFile", pdbFile);
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
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: 6,
        px: 2,
      }}
    >
      <Paper elevation={3} sx={{ width: "100%", maxWidth: 560, p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} mb={0.5}>
          RFdiffusion3 — Motif Scaffolding
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Submit a job to the{" "}
          <a href="https://neurosnap.ai/service/RFdiffusion3" target="_blank" rel="noreferrer">
            Neurosnap API
          </a>
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* PDB File Upload */}
          <Box>
            <Typography variant="body2" fontWeight={500} mb={0.75}>
              Input Structure (.pdb)
            </Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileOutlinedIcon />}
              sx={{ textTransform: "none", borderStyle: "dashed" }}
              fullWidth
            >
              {pdbFile ? pdbFile.name : "Choose .pdb file…"}
              <input
                type="file"
                accept=".pdb"
                hidden
                onChange={(e) => setPdbFile(e.target.files?.[0] ?? null)} // Update state with selected file or null if no file selected??
              />
            </Button>
          </Box>

          {/* Contig */}
          <TextField
            label="Contig"
            placeholder="e.g. 40-120,E6-155"
            value={contig}
            onChange={(e) => setContig(e.target.value)}
            required
            helperText="Motif segment + inpaint segment, e.g. 40-120,E6-155"
          />

          {/* Numeric parameters in a 3-column row */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            <TextField
              label="Number of Designs"
              type="number"
              inputProps={{ min: 1 }}
              value={numberDesigns}
              onChange={(e) => setNumberDesigns(e.target.value)}
            />
            <TextField
              label="Timesteps"
              type="number"
              inputProps={{ min: 10 }}
              value={timesteps}
              onChange={(e) => setTimesteps(e.target.value)}
            />
            <TextField
              label="Step Scale"
              type="number"
              inputProps={{ min: 0, step: 0.1 }}
              value={stepScale}
              onChange={(e) => setStepScale(e.target.value)}
            />
          </Box>

          {/* Status messages */}
          {error && <Alert severity="error">{error}</Alert>}
          {jobId && (
            <Alert severity="success">
              Job submitted! ID: <strong>{jobId}</strong>
            </Alert>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendOutlinedIcon />}
            disabled={loading}
            sx={{ mt: 1, textTransform: "none" }}
          >
            {loading ? "Submitting…" : "Submit Job"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}