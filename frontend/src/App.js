import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import HomeAlternative from './pages/HomeAlternative';
import Saved from './pages/Saved';
import Communities from './pages/Communities';
import CommunityPage from './pages/CommunityPage';
import NotFound from './pages/NotFound';
import ExplorePage from './pages/ExplorePage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Pages with Main Layout */}
                <Route path="/" element={
                    <Layout>
                        <Home />
                    </Layout>
                } />
                <Route path="/home" element={
                    <Layout>
                        <Home />
                    </Layout>
                } />
                <Route path="/profile" element={
                    <Layout>
                        <Profile />
                    </Layout>
                } />
                <Route path="/explore" element={
                    <Layout hideRightSidebar={true}>
                        <ExplorePage />
                    </Layout>
                } />
                <Route path="/saved" element={
                    <Layout>
                        <Saved />
                    </Layout>
                } />
                <Route path="/communities" element={
                    <Layout>
                        <Communities />
                    </Layout>
                } />
                <Route path="/community/:id" element={
                    <Layout>
                        <CommunityPage />
                    </Layout>
                } />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;
