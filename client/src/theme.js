import { createTheme, alpha } from '@mui/material/styles';

const lightPalette = {
  primary: {
    main: '#F18F70',
    contrastText: '#3F2A27'
  },
  secondary: {
    main: '#C66B3D',
    contrastText: '#FFF7F0'
  },
  background: {
    default: '#FFF7F0',
    paper: '#FFFFFF'
  },
  text: {
    primary: '#3F2A27',
    secondary: '#7B5B52'
  },
  divider: '#F1D9CE'
};

const darkPalette = {
  primary: {
    main: '#FFB59C',
    contrastText: '#2C1B18'
  },
  secondary: {
    main: '#F4B860',
    contrastText: '#2C1B18'
  },
  background: {
    default: '#211211',
    paper: '#2B1816'
  },
  text: {
    primary: '#FCEFE9',
    secondary: '#F4D9CE'
  },
  divider: '#3F2B28'
};

export const createAppTheme = (mode = 'light') => {
  const palette = mode === 'light' ? lightPalette : darkPalette;

  let theme = createTheme({
    palette: {
      mode,
      ...palette
    },
    shape: {
      borderRadius: 16
    },
    typography: {
      fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      h6: {
        fontWeight: 600
      },
      body1: {
        lineHeight: 1.6
      }
    }
  });

  theme = createTheme(theme, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: theme.palette.background.default,
            backgroundImage:
              mode === 'light'
                ? 'radial-gradient(circle at top left, rgba(241, 143, 112, 0.12), transparent 45%), radial-gradient(circle at bottom right, rgba(244, 184, 96, 0.12), transparent 50%)'
                : 'radial-gradient(circle at top left, rgba(255, 181, 156, 0.12), transparent 45%), radial-gradient(circle at bottom right, rgba(244, 184, 96, 0.08), transparent 50%)',
            color: theme.palette.text.primary,
            minHeight: '100vh'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 18,
            boxShadow:
              mode === 'light'
                ? '0px 20px 40px rgba(241, 143, 112, 0.12)'
                : '0px 20px 40px rgba(0, 0, 0, 0.4)'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 999,
            fontWeight: 600
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backdropFilter: 'blur(8px)',
            backgroundColor: alpha(theme.palette.background.paper, mode === 'light' ? 0.92 : 0.85),
            boxShadow:
              mode === 'light'
                ? '0 12px 24px rgba(63, 42, 39, 0.08)'
                : '0 12px 24px rgba(12, 8, 7, 0.65)',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none',
            color: theme.palette.text.primary
          }
        }
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingBottom: theme.spacing(4)
          }
        }
      }
    }
  });

  return theme;
};

const theme = createAppTheme();

export default theme;
