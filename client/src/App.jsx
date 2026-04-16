import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AISymptomChecker from './pages/AISymptomChecker';
import DoctorsList from './pages/DoctorsList';
import DoctorChat from './pages/DoctorChat';
import Dashboard from './pages/Dashboard';
import About from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Navbar />
          <main style={{flex: 1}}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/symptom-checker" element={<AISymptomChecker />} />
              <Route path="/doctors" element={<DoctorsList />} />
              <Route path="/about" element={<About />} />
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/chat/:sessionId" element={
                <ProtectedRoute><DoctorChat /></ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
