import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import theme from './theme'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ConfirmProvider } from 'material-ui-confirm'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <ConfirmProvider defaultOptions={{
        allowClose: false,
        dialogProps: { maxWidth: 'xs' },
        buttonOrder: ['confirm', 'cancel'],
        cancellationButtonProps: { color: 'inherit' },
        confirmationButtonProps: { color: 'secondary', variant: 'outlined' }
      }}>
        <CssBaseline />
        <App />
        <ToastContainer />
      </ConfirmProvider>
    </ThemeProvider>
  </Provider>
)
