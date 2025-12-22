import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import App from './App.jsx'
import theme from './theme'
import CssBaseline from '@mui/material/CssBaseline'
// Lưu ý: Dùng Experimental_CssVarsProvider cho extendTheme
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CssVarsProvider theme={theme}>
      <CssBaseline />
      <App />
    </CssVarsProvider>
  </StrictMode>
)
