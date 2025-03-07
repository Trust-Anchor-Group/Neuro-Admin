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
        <Typography variant="h4" fontWeight="bold" color="primary">
          
        </Typography>
        <Typography variant="subtitle1" color="gray">
          
        </Typography>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #ddd" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F8F9FA" }}>
              <TableCell sx={{ color: "#333", fontWeight: "bold" }}>User Name</TableCell>
              <TableCell sx={{ color: "#333", fontWeight: "bold" }}>ID Number</TableCell>
              <TableCell sx={{ color: "#333", fontWeight: "bold" }}>State</TableCell>
              <TableCell sx={{ color: "#333", fontWeight: "bold" }}>Created</TableCell>
              <TableCell align="center" sx={{ color: "#333", fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No ID requests found.
                </TableCell>
              </TableRow>
            ) : (
              userRequests.map((user) => (
                <TableRow key={user.id} hover sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" } }}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      
                      <Box>
                        <Typography fontWeight="bold">{user.name || "Unknown User"}</Typography>
                        <Typography variant="body2" color="gray">{user.email || "N/A"}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.idNumber || "N/A"}</TableCell>
                  <TableCell>
                    {user.state === "Pending" ? (
                      <Box sx={{
                        backgroundColor: "#FFF3CD",
                        color: "#856404",
                        padding: "4px 10px",
                        borderRadius: "10px",
                        display: "inline-block",
                        fontWeight: "bold"
                      }}>
                        ⏳ Pending
                      </Box>
                    ) : (
                      user.state
                    )}
                  </TableCell>
                  <TableCell>{user.createdDate || "N/A"}</TableCell>
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
