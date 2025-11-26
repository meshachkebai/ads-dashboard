import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedDashboard from './components/ProtectedDashboard';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ProtectedDashboard>
        <DashboardLayout>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/create" element={<CreateCampaignPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DashboardLayout>
      </ProtectedDashboard>
    </BrowserRouter>
  );
}

export default App;