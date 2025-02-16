import { fetchRequests } from "@/server/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Container,
  Box,
} from "@mui/material";
import ActionDropdown from "@/components/ui/ActionDropdown";

export default async function ManageIDRequests() {
  const requests = await fetchRequests(); // Fetch data server-side

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h3" fontWeight="bold" color="primary">
          {/* Manage ID Requests */}
        </Typography>
      </Box>
      <TableContainer component={Paper} elevation={5} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976D2" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>User Name</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Requested Date</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Access Level</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
              <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id} hover sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" } }}>
                <TableCell>{req.user}</TableCell>
                <TableCell>{req.requestedDate}</TableCell>
                <TableCell>{req.accessLevel}</TableCell>
                <TableCell>{req.status || "Pending"}</TableCell>
                <TableCell align="center">
                  <ActionDropdown requestId={req.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}