import { Box, InputLabel, TextField } from "@mui/material";

type FormTextFieldProps = {
  labelText: string;
  placeholder: string;
  isPassword: boolean;
};

export function FormTextField({
  labelText,
  placeholder,
  isPassword,
}: FormTextFieldProps) {
  return (
    <Box>
      <InputLabel sx={{ fontSize: "10pt" }}>{labelText}</InputLabel>
      <TextField
        type={isPassword ? "password" : "text"}
        placeholder={placeholder}
        sx={{ width: "100%", mt: "6px" }}
      />
    </Box>
  );
}
