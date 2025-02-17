"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "@/theme/EmotionCache";
import theme from "@/theme/theme";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import Link from "next/link";

const clientSideEmotionCache = createEmotionCache();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CacheProvider value={clientSideEmotionCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ background: "linear-gradient(90deg, #1976D2, #9C27B0)" }}>
              <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6"></Typography>
                <div>
                  <Button color="inherit" component={Link} href="/">Home</Button>
                  <Button color="inherit" component={Link} href="/admin/requests">Manage Requests</Button>
                </div>
              </Toolbar>
            </AppBar>
            <Container sx={{ marginTop: "80px", padding: "20px" }}>{children}</Container>
          </ThemeProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
