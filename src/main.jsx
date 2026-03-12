// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import theme from './theme'
import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'
import { ThemeProvider } from '@mui/material/styles'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ConfirmProvider } from 'material-ui-confirm'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
// Cấu hình react-router-dom với BrowserRouter
// tính ra cách interceptorLoadingElements của a cũng hay, đó giờ e toàn debounce func, action, api thôi :))
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'

const persistor = persistStore(store)

// Kỹ thuật Inject Store khi cần sử dụng biến redux store ở các file ngoài phạm vi component
import { injectStore } from './utils/authorizaAxios.js'
injectStore(store)


createRoot(document.getElementById('root')).render(
  <BrowserRouter
    basename='/' future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <ConfirmProvider defaultOptions={{
            allowClose: false,
            dialogProps: { maxWidth: 'xs' },
            buttonOrder: ['confirm', 'cancel'],
            cancellationButtonProps: { color: 'inherit' },
            confirmationButtonProps: { color: 'secondary', variant: 'outlined' }
          }}>
            <GlobalStyles styles={{ a: { textDecoration: 'none' } }} />
            <CssBaseline />
            <App />
            <ToastContainer />
          </ConfirmProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </BrowserRouter>
)
