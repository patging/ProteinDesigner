import { Button } from "@mui/material";

type FormSubmitButtonProps = {
  ButtonText: string;
  OnClick: () => void;
};

export function FormSubmitButton({
  ButtonText,
  OnClick,
}: FormSubmitButtonProps) {
  return (
    <Button
      variant="contained"
      onClick={OnClick}
      sx={{ height: "48px", width: "100%", borderRadius: "10px" }}
    >
      {ButtonText}
    </Button>
  );
}
