"use client";

import { Box, Container, Grid, Typography, Link, Divider } from "@mui/material";
import Image from "next/image";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#F8F9FA",
        color: "#333",
        mt: "auto", 
        py: 4,
        width: "100%", 
        textAlign: "center",
        boxShadow: "0 -1px 5px rgba(0,0,0,0.1)", 
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" fontWeight="bold">
              Neuro-Admin
            </Typography>
            <Typography variant="body2" color="gray">
              © {new Date().getFullYear()} Neuro-Admin. All rights reserved.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" fontWeight="bold">
              Quick Links
            </Typography>
            <Box>
              <Link href="/" color="inherit" underline="none" sx={{ display: "block", my: 1 }}>
                Home
              </Link>
              <Link href="/dashboard" color="inherit" underline="none" sx={{ display: "block", my: 1 }}>
                Dashboard
              </Link>
              <Link href="/contact" color="inherit" underline="none" sx={{ display: "block", my: 1 }}>
                Contact Us
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" fontWeight="bold">
              Follow Us
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 1, justifyContent: "center" }}>
              {/* <Link href="https://facebook.com" target="_blank" color="inherit">
                <FacebookIcon />
              </Link> */}
              {/* <Link href="https://twitter.com" target="_blank" color="inherit">
                <TwitterIcon />
              </Link> */}
              {/* <Link href="https://instagram.com" target="_blank" color="inherit">
                <InstagramIcon />
              </Link> */}
              <Link href="https://linkedin.com" target="_blank" color="inherit">
                <LinkedInIcon />
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
          <Image src="/neuroAdminLogo.svg" alt="logo" width={32} height={32} />
        </Box>
      </Container>
    </Box>
  );
}
