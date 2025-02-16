import { Container, Typography, Button, Box } from "@mui/material";

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: "linear-gradient(to right, #1976D2, #9C27B0)",
        color: "white",
      }}
    >
      <Container>
        <Typography variant="h3" gutterBottom fontWeight="bold">
        </Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>
          Manage access requests with a modern interface.
        </Typography>
        <Button
          href="/admin/requests"
          variant="contained"
          sx={{
            backgroundColor: "white",
            color: "#1976D2",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "#e3f2fd" },
          }}
        >
        Manage ID Requests
        </Button>
      </Container>
    </Box>
  );
}
