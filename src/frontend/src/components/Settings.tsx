import { supabase } from "../supabase";
import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { grey } from "@mui/material/colors";
import { ThemeProvider } from "@mui/material/styles";
import { DashboardPanel } from "./Dashboard";
import { DashboardTheme } from "../themes/DashboardTheme";

export function Settings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data.user) {
          throw new Error("Unable to resolve current user session");
        }

        setId(data.user.id);
        setEmail(data.user.email || "");

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/me/${data.user.id}`,
        );
        if (!res.ok) {
          throw new Error("Failed to fetch profile from backend");
        }

        const parsed = await res.json();
        setName(parsed.user.name || "");
      } catch (e: any) {
        setError(e?.message || "Unable to load settings");
      } finally {
        setLoading(false);
      }
    };

    currentUser();
  }, []);

  return (
    <ThemeProvider theme={DashboardTheme}>
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "space-between",
          px: "24px",
          gap: "48px",
        }}
      >
        <DashboardPanel />

        <Box sx={{ flex: 1, py: "16px" }}>
          <Typography variant="h1" sx={{ fontSize: "32pt", my: "16px" }}>
            Settings
          </Typography>

          <Box
            sx={{
              border: `1px solid ${grey[200]}`,
              borderRadius: "12px",
              boxShadow: `0 1px 4px 0 rgba(0,0,0,0.06)`,
              p: "24px",
              maxWidth: "720px",
              backgroundColor: "white",
            }}
          >
            {loading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CircularProgress size={20} />
                <Typography sx={{ color: grey[600] }}>
                  Loading profile...
                </Typography>
              </Box>
            )}

            {!loading && error && (
              <Typography sx={{ color: "error.main", fontSize: "13px" }}>
                {error}
              </Typography>
            )}

            {!loading && !error && (
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "18px" }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontSize: "12pt", color: grey[600] }}
                >
                  Account information
                </Typography>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      color: grey[500],
                      letterSpacing: "0.06em",
                    }}
                  >
                    Name
                  </Typography>
                  <Typography
                    sx={{ fontSize: "14px", color: grey[900], mt: "2px" }}
                  >
                    {name || "-"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      color: grey[500],
                      letterSpacing: "0.06em",
                    }}
                  >
                    Email
                  </Typography>
                  <Typography
                    sx={{ fontSize: "14px", color: grey[900], mt: "2px" }}
                  >
                    {email || "-"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      color: grey[500],
                      letterSpacing: "0.06em",
                    }}
                  >
                    User ID
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: grey[700],
                      mt: "2px",
                      fontFamily: "monospace",
                    }}
                  >
                    {id || "-"}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
