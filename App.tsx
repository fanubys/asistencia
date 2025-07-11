import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { DataProvider } from './context/DataContext.tsx';
import MainLayout from './components/layout/MainLayout.tsx';
import HomePage from './pages/HomePage.tsx';
import GroupsPage from './pages/GroupsPage.tsx';
import GroupDetailPage from './pages/GroupDetailPage.tsx';
import AttendancePage from './pages/AttendancePage.tsx';
import StatisticsPage from './pages/StatisticsPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import UpdateNotifier from './components/ui/UpdateNotifier.tsx';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DataProvider>
        <HashRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/inicio" replace />} />
              <Route path="/inicio" element={<HomePage />} />
              <Route path="/grupos" element={<GroupsPage />} />
              <Route path="/grupos/:groupId" element={<GroupDetailPage />} />
              <Route path="/asistencia/:groupId" element={<AttendancePage />} />
              <Route path="/estadisticas" element={<StatisticsPage />} />
              <Route path="/configuracion" element={<SettingsPage />} />
            </Routes>
          </MainLayout>
        </HashRouter>
        <UpdateNotifier />
      </DataProvider>
    </ThemeProvider>
  );
};

export default App;