import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route,
  createRoutesFromElements,
  createBrowserRouter,
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';

// Pages
import Landing from './pages/Landing';
import BigOrders from './pages/BigOrders';
import Recommended from './pages/Recommended';
import FullMenu from './pages/FullMenu';
import Game from './pages/Game';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import RegisterPage from './pages/RegisterPage';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF4B2B',
    },
    secondary: {
      main: '#2B2D42',
    },
    background: {
      default: '#F8F9FA',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <CartProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Navbar />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/bigorders"
                  element={
                    <PrivateRoute>
                      <BigOrders />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/recommended"
                  element={
                    <PrivateRoute>
                      <Recommended />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/menu"
                  element={
                    <PrivateRoute>
                      <FullMenu />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/game"
                  element={
                    <PrivateRoute>
                      <Game />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <PrivateRoute>
                      <Cart />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Router>
          </ThemeProvider>
        </CartProvider>
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;
