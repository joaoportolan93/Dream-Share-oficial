import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import ExplorePage from './pages/ExplorePage';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Communities from './pages/Communities';
import CommunityPage from './pages/CommunityPage';
import Saved from './pages/Saved';
import NotFound from './pages/NotFound';

// Components
import PrivateRoute from './components/PrivateRoute';

// Check if user is authenticated
const isAuthenticated = () => {
    return localStorage.getItem('access') !== null;
};

// Public Route - redirects to home if already logged in
const PublicRoute = ({ children }) => {
    if (isAuthenticated()) {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <AnimatePresence mode="wait">
                <Routes>
                    {/* Public Routes (Auth) */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        }
                    />

                    {/* Semi-Protected Route (needs auth but no layout) */}
                    <Route
                        path="/onboarding"
                        element={
                            <PrivateRoute>
                                <Onboarding />
                            </PrivateRoute>
                        }
                    />

                    {/* Protected Routes (with Layout) */}
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Home />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/feed"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Home />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/explore"
                        element={
                            <PrivateRoute>
                                <Layout hideRightSidebar>
                                    <ExplorePage />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Profile />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/communities"
                        element={
                            <PrivateRoute>
                                <Layout hideRightSidebar>
                                    <Communities />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/community/:id"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <CommunityPage />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/saved"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Saved />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/edit-profile"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <EditProfile />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Settings />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/notifications"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Notifications />
                                </Layout>
                            </PrivateRoute>
                        }
                    />

                    {/* 404 Not Found */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AnimatePresence>
        </Router>
    );
}

export default App;
