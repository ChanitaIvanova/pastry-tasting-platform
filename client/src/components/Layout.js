import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  AddCircle,
  Logout,
  Person,
  LightModeRounded,
  DarkModeRounded
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeModeContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const { mode, toggleColorMode } = useThemeMode();
  const theme = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    ...(user?.role === 'admin'
      ? [{ text: 'New Questionnaire', icon: <AddCircle />, path: '/questionnaires/new' }]
      : [])
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.paper,
          boxShadow:
            mode === 'light'
              ? '0 18px 36px rgba(63, 42, 39, 0.08)'
              : '0 18px 36px rgba(12, 8, 7, 0.6)'
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 1 }}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </IconButton>
          <Box
            component={Link}
            to="/dashboard"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: 1,
              gap: 1.5,
              '&:hover': {
                opacity: 0.85
              }
            }}
          >
            <Box
              component="img"
              src="/logo.jpg"
              alt="Pastry Tasting Platform"
              sx={{
                height: 44,
                width: 44,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${theme.palette.primary.main}`,
                boxShadow: '0 10px 20px rgba(0,0,0,0.12)'
              }}
            />
            <Box>
              <Typography variant="h6">Pastry Tasting Platform</Typography>
              <Typography variant="caption" color="text.secondary">
                Curate experiences one bite at a time
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              <IconButton color="inherit" onClick={toggleColorMode} aria-label="Toggle color mode">
                {mode === 'light' ? <DarkModeRounded /> : <LightModeRounded />}
              </IconButton>
            </Tooltip>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person fontSize="small" />
              <Typography variant="body2">{user?.username}</Typography>
            </Box>
            <Tooltip title="Log out">
              <IconButton color="inherit" onClick={handleLogout} aria-label="Log out">
                <Logout />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation">
          <List sx={{ py: 2 }}>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.primary.main }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ mx: 2 }} />
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: 8,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh'
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            pt: { xs: 2, sm: 3 }
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
