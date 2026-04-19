import { useParams } from "react-router";
import {
  Box,
  Typography,
  Button,
  Divider,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { ThemeProvider } from "@mui/material/styles";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Viewer } from "@e-infra/react-molstar-wrapper";
import type { Protein } from "@e-infra/react-molstar-wrapper";
import "@e-infra/react-molstar-wrapper/style.css";
import { useState, useEffect } from "react";
import { DashboardTheme } from "../themes/DashboardTheme";
import { DashboardPanel } from "./Dashboard";
import { supabase } from "../supabase";

type JobResult = {
  jobId: string;
  dateCreated: string;
  status: string;
  designMethod: string;
  targetProtein: string;
  outputFileUrl: string;
  outputFileUrls: string[];
  inputFileUrl: string;
  jobParameters: {
    contig: string | null;
    numDesigns: string | null;
    timeSteps: string | null;
    stepScale: string | null;
  };
};

function proxyUrl(blobUrl: string): string {
  return `${import.meta.env.VITE_API_URL}/api/blob-proxy?url=${encodeURIComponent(blobUrl)}`;
}

// Component to display metadata
function MetadataRow({
  label,
  value,
  loading,
}: {
  label: string;
  value: string | null;
  loading: boolean;
}) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          py: "16px",
          gap: "24px",
        }}
      >
        <Typography
          sx={{
            width: "160px",
            flexShrink: 0,
            fontSize: "13px",
            color: grey[400],
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={200} height={20} />
        ) : (
          <Typography sx={{ fontSize: "14px", color: grey[800] }}>
            {value ?? "—"}
          </Typography>
        )}
      </Box>
      <Divider sx={{ borderColor: grey[100] }} />
    </>
  );
}

// Main component
export function JobResults() {
  const { jobId } = useParams<{ jobId: string }>();

  const [result, setResult] = useState<JobResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [protein, setProtein] = useState<Protein | undefined>();
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [selectedDesignIndex, setSelectedDesignIndex] = useState(0);

  // Fetch job metadata
  useEffect(() => {
    if (!jobId) return;

    const fetchResult = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData.user)
          throw new Error("User session not found. Please log in again.");

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/jobs/${encodeURIComponent(jobId)}?userId=${encodeURIComponent(userData.user.id)}`,
          { method: "GET", credentials: "include" },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || res.statusText);

        const outputFileUrls =
          Array.isArray(data.outputFileUrls) && data.outputFileUrls.length > 0
            ? data.outputFileUrls
            : data.outputFileUrl
              ? [data.outputFileUrl]
              : [];

        setResult({
          jobId: data.jobId,
          dateCreated: data.createdAt
            ? new Date(data.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "—",
          status: data.status,
          designMethod: data.designMethod ?? "RFDiffusion",
          targetProtein: data.targetProtein ?? "—",
          outputFileUrl: outputFileUrls[0] ?? "",
          outputFileUrls,
          inputFileUrl: data.inputFileUrl ?? "",
          jobParameters: {
            contig: data.jobParameters?.contig ?? null,
            numDesigns: data.jobParameters?.numDesigns ?? null,
            timeSteps: data.jobParameters?.timeSteps ?? null,
            stepScale: data.jobParameters?.stepScale ?? null,
          },
        });
        setSelectedDesignIndex(0);
      } catch (err: any) {
        setError(err.message || "Failed to load job results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [jobId]);

  // Fetch structure file when result is loaded
  useEffect(() => {
    if (!result) return;

    const blobUrl =
      result.outputFileUrls[selectedDesignIndex] ||
      result.outputFileUrl ||
      result.inputFileUrl;
    if (!blobUrl) return;

    const loadStructure = async () => {
      setViewerLoading(true);
      setViewerError(null);
      setProtein(undefined);

      try {
        const response = await fetch(proxyUrl(blobUrl), {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok)
          throw new Error(
            `Failed to fetch structure file (${response.status})`,
          );

        const blob = await response.blob();
        const text = await blob.text();

        const file = new File([text], `${result.jobId}.pdb`, {
          type: "chemical/x-pdb",
        });

        setProtein({ file });
      } catch (err: any) {
        setViewerError(err.message || "Unable to load structure file.");
      } finally {
        setViewerLoading(false);
      }
    };

    loadStructure();
  }, [result, selectedDesignIndex]);

  // Download designed PDB file
  const handleDownloadPdb = () => {
    const blobUrl =
      result?.outputFileUrls[selectedDesignIndex] ||
      result?.outputFileUrl ||
      result?.inputFileUrl;
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = proxyUrl(blobUrl);
    a.download = `${jobId}_design_${selectedDesignIndex + 1}.pdb`;
    a.click();
  };

  // Download metadata as JSON
  const handleDownloadMetadata = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${jobId}_metadata.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const structureAvailable =
    result?.outputFileUrls[selectedDesignIndex] ||
    result?.outputFileUrl ||
    result?.inputFileUrl;

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

        {/* Right: content */}
        <Box sx={{ flex: 1, minWidth: 0, py: "24px", pb: "48px" }}>
          <Typography variant="h1" sx={{ fontSize: "32pt", mb: "4px" }}>
            Job Results
          </Typography>
          <Typography sx={{ fontSize: "13px", color: grey[500], mb: "32px" }}>
            Details for completed protein design job
          </Typography>

          {error && (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "error.light",
                borderRadius: "8px",
                p: "16px",
                mb: "24px",
              }}
            >
              <Typography sx={{ color: "error.main", fontSize: "14px" }}>
                {error}
              </Typography>
            </Box>
          )}

          {/* 3D Structure */}
          <Typography
            variant="h2"
            sx={{ fontSize: "16pt", fontWeight: 700, mb: "16px" }}
          >
            3D Structure
          </Typography>
          {!!result?.outputFileUrls?.length && (
            <Box sx={{ mb: "16px" }}>
              <Typography sx={{ fontSize: "13px", color: grey[600], mb: 1 }}>
                Select Design
              </Typography>
              <ToggleButtonGroup
                value={selectedDesignIndex}
                exclusive
                onChange={(_, value) => {
                  if (value !== null) {
                    setSelectedDesignIndex(value);
                  }
                }}
                size="small"
                sx={{
                  flexWrap: "wrap",
                  gap: "8px",
                  "& .MuiToggleButton-root": {
                    textTransform: "none",
                    borderRadius: "8px !important",
                    borderColor: grey[300],
                    color: grey[700],
                    px: "12px",
                  },
                  "& .Mui-selected": {
                    backgroundColor: `${grey[900]} !important`,
                    color: "white !important",
                  },
                }}
              >
                {result.outputFileUrls.map((_, index) => (
                  <ToggleButton key={index} value={index}>
                    Design {index + 1}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          )}
          <Box sx={{ height: 420, width: "100%", position: "relative" }}>
            {viewerLoading && (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Skeleton variant="rectangular" width="100%" height="100%" />
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
                  border: "1px solid",
                  borderColor: grey[200],
                  borderRadius: "8px",
                  px: "16px",
                }}
              >
                <Typography sx={{ color: "error.main", fontSize: "14px" }}>
                  {viewerError}
                </Typography>
              </Box>
            )}
            {!viewerLoading && !viewerError && protein && (
              <Viewer proteins={[protein]} height={420} />
            )}
          </Box>

          {/* Download */}
          <Typography
            variant="h2"
            sx={{ fontSize: "16pt", fontWeight: 700, mb: "16px" }}
          >
            Download
          </Typography>
          <Box sx={{ display: "flex", gap: "12px", mb: "40px" }}>
            <Button
              variant="contained"
              startIcon={<DownloadOutlinedIcon />}
              onClick={handleDownloadPdb}
              disabled={loading || !structureAvailable}
              sx={{ textTransform: "none", borderRadius: "8px", px: "20px" }}
            >
              Download PDB
            </Button>
            <Button
              variant="outlined"
              startIcon={<DescriptionOutlinedIcon />}
              onClick={handleDownloadMetadata}
              disabled={loading || !result}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                px: "20px",
                borderColor: grey[300],
                color: grey[700],
                "&:hover": {
                  borderColor: grey[500],
                  backgroundColor: grey[50],
                },
              }}
            >
              Download Metadata
            </Button>
          </Box>

          {/* Metadata Summary */}
          <Typography
            variant="h2"
            sx={{ fontSize: "16pt", fontWeight: 700, mb: "8px" }}
          >
            Metadata Summary
          </Typography>
          <Divider sx={{ borderColor: grey[100], mb: 0 }} />
          <MetadataRow
            label="Job ID"
            value={result?.jobId ?? null}
            loading={loading}
          />
          <MetadataRow
            label="Date Created"
            value={result?.dateCreated ?? null}
            loading={loading}
          />
          <MetadataRow
            label="Status"
            value={result?.status ?? null}
            loading={loading}
          />
          <MetadataRow
            label="Design Method"
            value={result?.designMethod ?? null}
            loading={loading}
          />
          <MetadataRow
            label="Contig"
            value={result?.jobParameters.contig ?? null}
            loading={loading}
          />
          <MetadataRow
            label="Number of Designs"
            value={result?.jobParameters.numDesigns ?? null}
            loading={loading}
          />
          <MetadataRow
            label="Timesteps"
            value={result?.jobParameters.timeSteps ?? null}
            loading={loading}
          />
          <MetadataRow
            label="Step Scale"
            value={result?.jobParameters.stepScale ?? null}
            loading={loading}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
