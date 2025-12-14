"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { ReactNode } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Head from "next/head";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

export default function RootLayout({ children }: Readonly<{ children: ReactNode; }>)
{
  return (
    <html lang="en">
      <Head>
        <title>TrainBrain</title>
        <meta name="description" content="Model train controller software" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
