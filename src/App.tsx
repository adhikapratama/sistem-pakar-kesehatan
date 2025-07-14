import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Diagnose from './pages/Diagnose';
import Education from './pages/Education';
import History from './pages/History';
import AdminDashboard from './pages/admin/Dashboard';
import AdminSymptoms from './pages/admin/Symptoms';
import AdminDiseases from './pages/admin/Diseases';
import AdminRules from './pages/admin/Rules';
import AdminArticles from './pages/admin/Articles';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/diagnose" element={
                <ProtectedRoute>
                  <Diagnose />
                </ProtectedRoute>
              } />
              <Route path="/education" element={<Education />} />
              <Route path="/history" element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/symptoms" element={
                <ProtectedRoute requireAdmin>
                  <AdminSymptoms />
                </ProtectedRoute>
              } />
              <Route path="/admin/diseases" element={
                <ProtectedRoute requireAdmin>
                  <AdminDiseases />
                </ProtectedRoute>
              } />
              <Route path="/admin/rules" element={
                <ProtectedRoute requireAdmin>
                  <AdminRules />
                </ProtectedRoute>
              } />
              <Route path="/admin/articles" element={
                <ProtectedRoute requireAdmin>
                  <AdminArticles />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;