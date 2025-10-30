import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme } from '../theme';

const ThemeModeContext = React.createContext({
  mode: 'light',
  toggleColorMode: () => {}
});

const getInitialMode = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem('app-color-mode');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return 'light';
};

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = React.useState(getInitialMode);

  const toggleColorMode = React.useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('app-color-mode', mode);
    }
  }, [mode]);

  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  const contextValue = React.useMemo(
    () => ({
      mode,
      toggleColorMode
    }),
    [mode, toggleColorMode]
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => React.useContext(ThemeModeContext);
