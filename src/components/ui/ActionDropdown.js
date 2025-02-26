"use client";

import { useState } from "react";
import { Menu, MenuItem, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

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
        <MenuItem onClick={() => handleUpdate("Approved")} sx={{ color: "green" }}>Approve</MenuItem>
        <MenuItem onClick={() => handleUpdate("Rejected")} sx={{ color: "red" }}> Reject</MenuItem>
        <MenuItem onClick={() => handleUpdate("Obsoleted")} sx={{ color: "orange" }}> Obsolete</MenuItem>
      </Menu>
    </>
  );
}
