import { Box, Typography } from "@mui/material";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import { blue, grey } from "@mui/material/colors";

type FormHeaderProps = {
  TopText: string;
  BottomText: string;
};

export function FormHeader({ TopText, BottomText }: FormHeaderProps) {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        gap: "5px",
      }}
    >
      <Box
        sx={{
          width: "48px",
          height: "36px",
          borderRadius: "15px",
          backgroundColor: blue[700],
          mx: "auto",
          mb: "10px",
        }}
      >
        <PrecisionManufacturingIcon sx={{ margin: "5px", color: "white" }} />
      </Box>

      <Typography variant={"h5"} sx={{ fontSize: "32", fontWeight: "bold" }}>
        {TopText}
      </Typography>
      <Typography sx={{ color: grey[600], fontSize: "16" }}>
        {BottomText}
      </Typography>
    </Box>
  );
}
