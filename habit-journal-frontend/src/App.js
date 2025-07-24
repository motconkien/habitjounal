import logo from './logo.svg';
import './App.css';
import { setAuthToken } from './api';
import Login from './pages/Login';
import Register from './pages/Register';
import Sidebar from './components/Sidebar';
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Habit from "./pages/Habit";
import Todo from "./pages/Todo";
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { RxHamburgerMenu } from "react-icons/rx";


import './styles.css';
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSideBarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setAuthToken(null);
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setAuthToken(token);
      setIsLoggedIn(true);
      setAuthChecked(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };



  const [username, setUsername] = useState(localStorage.getItem('username'));
  useEffect(() => {
    const storedName = localStorage.getItem('username');
    setUsername(storedName);
  }, [isLoggedIn]); // update username when login state changes


  // mobile or not
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  //close if switching from mobiel to desktop
  useEffect(() => {
    if (!isMobile) setSideBarOpen(false);
  }, [isMobile]);


  if (!authChecked) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* AUTH ROUTES */}
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" />
              ) : (
                <div className="login-wrapper">
                  <div className="login-container">
                    <Login onLogin={handleLogin} />
                    <p>
                      Don't have an account?{' '}
                      <Link to="/register" style={{ cursor: 'pointer' }}>
                        Register
                      </Link>
                    </p>
                  </div>
                </div>
              )
            }
          />
          <Route
            path="/register"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" />
              ) : (
                <div className="login-wrapper">
                  <div className="login-container">
                    <Register />
                    <p>
                      Already have an account?{' '}
                      <Link to="/login" style={{ cursor: 'pointer' }}>
                        Login
                      </Link>
                    </p>
                  </div>
                </div>
              )
            }
          />
        </Routes>
      </Router>
    );
  }
  return (
    <Router>
      <Routes>

        {/* AUTH ROUTES */}
        {/* <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" />
            ) : (
              <div className="login-wrapper">
                <div className="login-container">
                  <Login onLogin={handleLogin} />
                  <p>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ cursor: 'pointer' }}>
                      Register
                    </Link>
                  </p>
                </div>
              </div>
            )
          }
        /> */}
        {/* <Route
          path="/register"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" />
            ) : (
              <div className="login-wrapper">
                <div className="login-container">
                  <Register />
                  <p>
                    Already have an account?{' '}
                    <Link to="/login" style={{ cursor: 'pointer' }}>
                      Login
                    </Link>
                  </p>
                </div>
              </div>
            )
          }
        /> */}

        {/* APP ROUTES (PROTECTED) */}
        <Route
          path="/*"
          element={
            isLoggedIn ? (
              isMobile ? (
                //mobile layout
                <>
                  <div className="mobile-header">
                    <RxHamburgerMenu onClick={() => setSideBarOpen(!sidebarOpen)} />
                  </div>
                  {sidebarOpen && (
                    <Sidebar
                      username={username}
                      handleLogout={handleLogout}
                      open={sidebarOpen}
                      close={() => setSideBarOpen(false)}
                      isMobile={true}
                    />
                  )}
                  <div className="main-content">
                    <Routes>
                      <Route index element={<Navigate to="/dashboard" />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/journal" element={<Journal />} />
                      <Route path="/habit" element={<Habit />} />
                      <Route path="/todo" element={<Todo />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </div>

                </>
              ) : (
                //Desktop layout
                < div className="app-container">
                  <div className="sidebar-wrapper">
                    {isMobile && (
                      <RxHamburgerMenu onClick={() => setSideBarOpen(!sidebarOpen)} />
                    )}
                    <Sidebar
                      username={username}
                      handleLogout={handleLogout}
                      isMobile={false} />
                  </div>
                  <div className="main-content">
                    <Routes>
                      <Route index element={<Navigate to="/dashboard" />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/journal" element={<Journal />} />
                      <Route path="/habit" element={<Habit />} />
                      <Route path="/todo" element={<Todo />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </div>
                </div>
              )

            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

