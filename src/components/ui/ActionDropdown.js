"use client";

import { useState } from "react";
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import SecurityIcon from "@mui/icons-material/Security";

export default function ActionDropdown({ requestId }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleUpdate = (status) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/updateRequest"; 
    form.style.display = "none";

    const idInput = document.createElement("input");
    idInput.name = "id";
    idInput.value = requestId;
    form.appendChild(idInput);

    const statusInput = document.createElement("input");
    statusInput.name = "status";
    statusInput.value = status;
    form.appendChild(statusInput);

    document.body.appendChild(form);
    form.submit();

    handleMenuClose();
  };

  return (
    <>
      <IconButton onClick={handleMenuClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleUpdate("Approved")} sx={{ color: "green" }}>
          <ListItemIcon>
            <CheckCircleIcon sx={{ color: "green" }} />
          </ListItemIcon>
          <ListItemText primary="Approve" />
        </MenuItem>
        <MenuItem onClick={() => handleUpdate("Rejected")} sx={{ color: "red" }}>
          <ListItemIcon>
            <CancelIcon sx={{ color: "red" }} />
          </ListItemIcon>
          <ListItemText primary="Reject" />
        </MenuItem>
        <MenuItem onClick={() => handleUpdate("Obsoleted")} sx={{ color: "gray" }}>
          <ListItemIcon>
            <DeleteIcon sx={{ color: "gray" }} />
          </ListItemIcon>
          <ListItemText primary="Mark as Obsolete" />
        </MenuItem>
        <MenuItem onClick={() => handleUpdate("Compromised")} sx={{ color: "purple" }}>
          <ListItemIcon>
            <SecurityIcon sx={{ color: "purple" }} />
          </ListItemIcon>
          <ListItemText primary="Mark as Compromised" />
        </MenuItem>
      </Menu>
    </>
  );
}
