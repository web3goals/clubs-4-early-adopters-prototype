import {
  AppBar,
  Breakpoint,
  Container,
  Link as MuiLink,
  SxProps,
  Toolbar,
} from "@mui/material";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import Link from "next/link";

export default function Layout(props: {
  maxWidth?: Breakpoint | false;
  children: any;
}) {
  return (
    <Box sx={{ background: "#FFE9E1" }}>
      <CssBaseline />
      <Head>
        <title>Social Monkeys</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Navigation />
      <Container
        maxWidth={props.maxWidth !== undefined ? props.maxWidth : "md"}
        sx={{ minHeight: "100vh" }}
      >
        <Box sx={{ py: 6 }}>
          <Toolbar />
          {props.children}
        </Box>
      </Container>
    </Box>
  );
}

function Navigation() {
  return (
    <AppBar
      color="inherit"
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: "solid 1px #DDDDDD",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Logo sx={{ flexGrow: 1 }} />
          <Links sx={{ ml: 1 }} />
        </Toolbar>
      </Container>
    </AppBar>
  );
}

function Logo(props: { sx?: SxProps }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", ...props.sx }}>
      <Link href="/" passHref legacyBehavior>
        <MuiLink
          variant="h6"
          color="#000000"
          fontWeight={700}
          display={{ xs: "none", md: "flex" }}
        >
          🐒 Social Monkeys
        </MuiLink>
      </Link>
      <Link href="/" passHref legacyBehavior>
        <MuiLink
          variant="h6"
          color="#000000"
          fontWeight={700}
          display={{ xs: "flex", md: "none" }}
        >
          🐒 Social Monkeys
        </MuiLink>
      </Link>
    </Box>
  );
}

function Links(props: { sx?: SxProps }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", ...props.sx }}>
      <Box ml={3.5}>
        <ConnectButton showBalance={false} chainStatus="icon" />
      </Box>
    </Box>
  );
}
