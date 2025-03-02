"use client";

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

export default function ManageIDRequests({ userRequests }) {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h3" fontWeight="bold" color="primary">
        </Typography>
      </Box>
      <TableContainer component={Paper} elevation={5} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976D2" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>User Name</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Created Date</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>State</TableCell>
              <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No ID requests found.
                </TableCell>
              </TableRow>
            ) : (
              userRequests.map((user) => (
                <TableRow key={user.id} hover sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" } }}>
                  <TableCell>{user.name || "Unknown User"}</TableCell>
                  <TableCell>{user.createdDate || "N/A"}</TableCell>
                  <TableCell>{user.state || "Pending"}</TableCell>
                  <TableCell align="center">
                    <ActionDropdown requestId={user.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
