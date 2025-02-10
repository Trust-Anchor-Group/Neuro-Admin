import { fetchRequests, updateRequestStatus } from "../../../server/actions";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Typography, Container
} from "@mui/material";

export default async function ManageIDRequests() { 
  const requests = await fetchRequests(); // Fetching data server-side

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom textAlign="center">
        📋 Manage ID Requests
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell><strong>User Name</strong></TableCell>
              <TableCell><strong>Requested Date</strong></TableCell>
              <TableCell><strong>Access Level</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id} hover>
                <TableCell>{req.user}</TableCell>
                <TableCell>{req.requestedDate}</TableCell>
                <TableCell>{req.accessLevel}</TableCell>
                <TableCell align="center">
                  <form action={updateRequestStatus}>
                    <input type="hidden" name="id" value={req.id} />
                    <input type="hidden" name="status" value="Approved" />
                    <Button type="submit" variant="contained" color="success" sx={{ mx: 1 }}>
                      ✅ Approve
                    </Button>
                  </form>
                  <form action={updateRequestStatus}>
                    <input type="hidden" name="id" value={req.id} />
                    <input type="hidden" name="status" value="Rejected" />
                    <Button type="submit" variant="contained" color="error" sx={{ mx: 1 }}>
                      ❌ Reject
                    </Button>
                  </form>
                  <form action={updateRequestStatus}>
                    <input type="hidden" name="id" value={req.id} />
                    <input type="hidden" name="status" value="Obsoleted" />
                    <Button type="submit" variant="contained" color="warning" sx={{ mx: 1 }}>
                      📌 Obsolete
                    </Button>
                  </form>
                  <form action={updateRequestStatus}>
                    <input type="hidden" name="id" value={req.id} />
                    <input type="hidden" name="status" value="Compromised" />
                    <Button type="submit" variant="contained" color="secondary" sx={{ mx: 1 }}>
                      ⚠️ Compromised
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
