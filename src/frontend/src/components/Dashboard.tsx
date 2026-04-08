import {
  Box,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import { blue, grey, green, red, orange } from "@mui/material/colors";
import { type SvgIconProps, MenuItem, FormControl } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import Select from "@mui/material/Select";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import SearchIcon from "@mui/icons-material/Search";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Link, useNavigate } from "react-router";
import { DashboardTheme } from "../themes/DashboardTheme";
import { JobStatus } from "../types/JobStatus";
import { supabase } from "../supabase";
import { useState, useEffect } from "react";
import { Viewer } from "@e-infra/react-molstar-wrapper";
import type { Protein } from "@e-infra/react-molstar-wrapper";
import "@e-infra/react-molstar-wrapper/style.css";

interface DashboardLinkProps {
  labelText: string;
  linkTo: string;
  onClick?: () => void;
  children: React.ReactNode & SvgIconProps;
}

interface DashboardSelectProps {
  labelText: string;
  options: string[];
}

type Job = {
  job_id: string;
  name: string;
  status: string;
  timeCreated: string;
  proteinInput: string;
  proteinInputUrl: string;
  proteinDesign: string;
  proteinDesignUrl: string;
};

interface InnerTableProps {
  jobs: Job[];
  loading: boolean;
  statusFilter: string;
  searchQuery: string;
}

// Maps a job status string to a MUI Chip color + label
function StatusChip({ status }: { status: string }) {
  const s = status.toLowerCase();

  const config: Record<string, { label: string; bg: string; color: string }> = {
    [JobStatus.COMPLETED]: {
      label: "Completed",
      bg: green[50],
      color: green[800],
    },
    [JobStatus.FAILED]: { label: "Failed", bg: red[50], color: red[800] },
    pending: { label: "Pending", bg: orange[50], color: orange[800] },
    running: { label: "Running", bg: blue[50], color: blue[800] },
  };

  const cfg = config[s] ?? { label: status, bg: grey[100], color: grey[700] };

  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
        fontSize: "11px",
        height: "22px",
        borderRadius: "6px",
      }}
    />
  );
}

function DashboardLink({
  labelText,
  linkTo,
  children,
  onClick,
}: DashboardLinkProps) {
  const backgroundColor = location.pathname === linkTo ? grey[200] : "white";

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
      <Box sx={{ ml: "12px" }}>
        {onClick ? (
          <Typography variant="h6" style={{ cursor: "pointer" }}>
            {labelText}
          </Typography>
        ) : (
          <Link to={linkTo} style={{ textDecoration: "None", color: "black" }}>
            <Typography variant="h6">{labelText}</Typography>
          </Link>
        )}
      </Box>
    </Box>
  );
}

export function DashboardPanel() {
  const [name, setName] = useState("");
  useEffect(() => {
    const currentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        console.log(
          "error with supabase returning a user, maybe session problem",
        );
        return;
      }
      const res = await fetch(`http://localhost:4000/me/${data.user.id}`);
      if (!res) {
        console.log("error fetching from our backend endpoint me");
        return;
      }
      const parsed = await res.json();
      if (!parsed) {
        console.log("error parsing me response data");
      }
      setName(parsed.user.name);
    };
    currentUser();
  }, []);
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
        <DashboardLink labelText="Settings" linkTo="/settings">
          <SettingsOutlinedIcon />
        </DashboardLink>
        <DashboardLink labelText="Log Out" onClick={handleLogout} linkTo="">
          <ExitToAppOutlinedIcon />
        </DashboardLink>
      </Box>
    </Box>
  );
}

function DashboardSelect({ labelText, options }: DashboardSelectProps) {
  return (
    <FormControl sx={{ mr: "12px" }}>
      <Select
        value={""}
        displayEmpty
        sx={{ width: "128px", maxHeight: "32px", bgcolor: grey[200] }}
        inputProps={{ "aria-label": labelText }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {options.map((val) => (
          <MenuItem key={val} value={val}>
            {val}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// Shared sx for header cells
const headerCellSx = {
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  color: grey[500],
  py: "10px",
  borderBottom: `2px solid ${grey[200]}`,
  backgroundColor: grey[50],
  whiteSpace: "nowrap" as const,
};

// Shared sx for body cells
const bodyCellSx = {
  fontSize: "13px",
  color: grey[800],
  py: "14px",
  borderBottom: `1px solid ${grey[100]}`,
};

function InnerTable({
  jobs,
  loading,
  statusFilter,
  searchQuery,
}: InnerTableProps) {
  const navigate = useNavigate();
  const [openViewer, setOpenViewer] = useState(false);
  const [viewerProtein, setViewerProtein] = useState<Protein | undefined>();
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);

  const getFileNameFromUrl = (url: string, fallbackLabel: string) => {
    try {
      const parsed = new URL(url);
      const fileName = parsed.pathname.split("/").pop();
      if (fileName && fileName.trim().length > 0) {
        return fileName;
      }
    } catch {
      // Ignore URL parsing error and use fallback name.
    }

    return `${fallbackLabel.toLowerCase().replace(/\s+/g, "_")}.pdb`;
  };

  const handleOpenViewer = async (url: string, label: string) => {
    setViewerTitle(label);
    setOpenViewer(true);
    setViewerLoading(true);
    setViewerError(null);
    setViewerProtein(undefined);

    try {
      const proxyUrl = `http://localhost:4000/api/blob-proxy?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch file (${response.status})`);
      }

      const blob = await response.blob();
      const fileName = getFileNameFromUrl(url, label);
      const file = new File([blob], fileName, {
        type: blob.type || "chemical/x-pdb",
      });

      setViewerProtein({ file });
    } catch (error: any) {
      setViewerError(
        error?.message ||
          "Unable to load this structure. Check blob URL access and CORS settings.",
      );
    } finally {
      setViewerLoading(false);
    }
  };

  const handleCloseViewer = () => {
    setOpenViewer(false);
    setViewerLoading(false);
    setViewerError(null);
    setViewerProtein(undefined);
  };

  const handleViewResults = (jobId: string) => {
    navigate(`/results/${jobId}`);
  };

  return (
    <>
      <TableContainer
        sx={{
          border: `1px solid ${grey[200]}`,
          borderRadius: "12px",
          minHeight: "407px",
          maxHeight: "600px",
          boxShadow: `0 1px 4px 0 rgba(0,0,0,0.06)`,
          overflow: "hidden",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Job Name</TableCell>
              <TableCell sx={headerCellSx}>Status</TableCell>
              <TableCell sx={headerCellSx}>Created</TableCell>
              <TableCell sx={headerCellSx}>Protein Input</TableCell>
              <TableCell sx={headerCellSx}>Protein Design</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job: Job) => (
              <TableRow
                key={job.job_id}
                sx={{
                  "&:last-child td": { borderBottom: "none" },
                  "&:hover": { backgroundColor: grey[50] },
                  transition: "background-color 0.15s ease",
                }}
              >
                {/* Job Name */}
                <TableCell
                  sx={{ ...bodyCellSx, fontWeight: 600, color: grey[900] }}
                >
                  {job.name}
                </TableCell>

                {/* Status */}
                <TableCell sx={bodyCellSx}>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <StatusChip status={job.status} />
                    {(job.status.toLowerCase() === JobStatus.COMPLETED ||
                      job.status.toLowerCase() === JobStatus.FAILED) && (
                      <OpenInNewIcon
                        sx={{ height: "14px", width: "14px", color: grey[400] }}
                      />
                    )}
                  </Box>
                </TableCell>

                {/* Created */}
                <TableCell
                  sx={{
                    ...bodyCellSx,
                    color: grey[500],
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {job.timeCreated}
                </TableCell>

                {/* Protein Input */}
                <TableCell sx={bodyCellSx}>
                  {job.proteinInputUrl ? (
                    <Typography
                      onClick={() =>
                        handleOpenViewer(job.proteinInputUrl, "Input Structure")
                      }
                      sx={{
                        fontSize: "13px",
                        color: blue[600],
                        cursor: "pointer",
                        fontWeight: 500,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        "&:hover": {
                          color: blue[800],
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {job.proteinInput}
                      <OpenInNewIcon sx={{ width: "13px", height: "13px" }} />
                    </Typography>
                  ) : (
                    <Typography sx={{ fontSize: "13px", color: grey[400] }}>
                      —
                    </Typography>
                  )}
                </TableCell>

                {/* Protein Design Let's load this protein into memory via blob, then pass the local file into the molstar viewer*/}
                <TableCell sx={bodyCellSx}>
                  <Box
                    sx={{ display: "flex", gap: "8px", alignItems: "center" }}
                  >
                    {job.proteinDesignUrl ? (
                      <Typography
                        onClick={() =>
                          handleOpenViewer(
                            job.proteinDesignUrl,
                            "Designed Structure",
                          )
                        }
                        sx={{
                          fontSize: "13px",
                          color: blue[600],
                          cursor: "pointer",
                          fontWeight: 500,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          "&:hover": {
                            color: blue[800],
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {job.proteinDesign}
                        <OpenInNewIcon sx={{ width: "13px", height: "13px" }} />
                      </Typography>
                    ) : (
                      <Typography sx={{ fontSize: "13px", color: grey[400] }}>
                        —
                      </Typography>
                    )}
                    {job.status.toLowerCase() === JobStatus.COMPLETED && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewResults(job.job_id)}
                        sx={{
                          textTransform: "none",
                          fontSize: "11px",
                          py: "2px",
                          px: "10px",
                          borderRadius: "6px",
                          borderColor: grey[300],
                          color: grey[700],
                          "&:hover": {
                            borderColor: grey[500],
                            backgroundColor: grey[50],
                          },
                        }}
                      >
                        Results
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              gap: "10px",
            }}
          >
            <CircularProgress size={24} />
            <Typography sx={{ fontSize: "14px", color: grey[500] }}>
              Loading jobs...
            </Typography>
          </Box>
        )}

        {!loading && jobs.length === 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              {statusFilter !== "all" || searchQuery.trim() !== "" ? (
                <Typography sx={{ fontSize: "14px", color: grey[400] }}>
                  No {statusFilter !== "all" ? statusFilter : "matching"} jobs
                  found
                </Typography>
              ) : (
                <>
                  <Typography
                    sx={{ fontSize: "14px", color: grey[400], mb: "8px" }}
                  >
                    No jobs yet
                  </Typography>
                  <Link
                    style={{
                      color: blue[600],
                      fontWeight: 500,
                      textDecoration: "none",
                      fontSize: "13px",
                    }}
                    to="/create"
                  >
                    Create your first design →
                  </Link>
                </>
              )}
            </Box>
          </Box>
        )}
      </TableContainer>

      {/* Molstar Viewer Dialog — uses @e-infra/react-molstar-wrapper */}
      <Dialog
        open={openViewer}
        onClose={handleCloseViewer}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "12px", overflow: "hidden" },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${grey[200]}`,
            py: "12px",
            px: "20px",
            fontSize: "14px",
            fontWeight: 600,
            color: grey[800],
          }}
        >
          {viewerTitle}
          <IconButton
            onClick={handleCloseViewer}
            size="small"
            sx={{ color: grey[500] }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: "640px" }}>
          {viewerLoading && (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <CircularProgress size={28} />
              <Typography sx={{ color: grey[600], fontSize: "13px" }}>
                Loading structure...
              </Typography>
            </Box>
          )}

          {!viewerLoading && viewerError && (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: "24px",
              }}
            >
              <Typography
                sx={{ color: red[700], fontSize: "13px", textAlign: "center" }}
              >
                {viewerError}
              </Typography>
            </Box>
          )}

          {!viewerLoading && !viewerError && viewerProtein && (
            <Viewer proteins={[viewerProtein]} height={640} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function DashboardTable() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          console.error("No authenticated user found", error);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:4000/api/jobs?userId=${encodeURIComponent(data.user.id)}`,
          { method: "GET", credentials: "include" },
        );

        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.message || response.statusText);

        const jobsData = payload.jobs ?? [];

        const mappedJobs: Job[] = jobsData.map((job: any) => {
          const created = job.createdAt
            ? new Date(job.createdAt).toLocaleDateString()
            : "-";

          return {
            job_id: job.jobId,
            name: job.jobId.substring(0, 8),
            status: job.status,
            timeCreated: created,
            proteinInput: "Input",
            proteinInputUrl: job.inputFileUrl || "",
            proteinDesign: job.outputFileUrl ? "Design" : "-",
            proteinDesignUrl: job.outputFileUrl || "",
          };
        });

        setJobs(mappedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus =
      statusFilter === "all" || job.status.toLowerCase() === statusFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.job_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h1" sx={{ fontSize: "32pt", my: "16px" }}>
        Jobs
      </Typography>

      {/* Filter bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          mb: "20px",
          flexWrap: "wrap",
        }}
      >
        <OutlinedInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or ID…"
          size="small"
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 16, color: grey[400] }} />
            </InputAdornment>
          }
          sx={{ width: "260px", fontSize: "13px", borderRadius: "8px" }}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Typography sx={{ fontSize: "12px", color: grey[500] }}>
            Status
          </Typography>
          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={(_, val) => {
              if (val !== null) setStatusFilter(val);
            }}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontSize: "12px",
                px: "12px",
                py: "4px",
                borderRadius: "20px !important",
                border: `1px solid ${grey[300]} !important`,
                color: grey[600],
                mx: "2px",
              },
              "& .Mui-selected": {
                backgroundColor: `${grey[900]} !important`,
                color: "white !important",
              },
            }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="running">Running</ToggleButton>
            <ToggleButton value="completed">Completed</ToggleButton>
            <ToggleButton value="failed">Failed</ToggleButton>
            <ToggleButton value="pending">Pending</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <InnerTable
        jobs={filteredJobs}
        loading={loading}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
      />
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
