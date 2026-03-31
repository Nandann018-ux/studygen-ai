import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import StudyPlan from './pages/StudyPlan';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="plan" element={<StudyPlan />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
export default App;
