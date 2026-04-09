import { Box, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";

export default function PlaceholderPage() {
  const location = useLocation();
  const pageName = location.pathname.substring(1).replace(/-/g, " ").toUpperCase();

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Typography variant="h4" color="text.secondary">
        {pageName || "PAGE"} CONTENT GOES HERE
      </Typography>
    </Box>
  );
}
