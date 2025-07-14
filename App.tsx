
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { DataProvider } from './context/DataContext.tsx';
import MainLayout from './components/layout/MainLayout.tsx';
import HomePage from './pages/HomePage.tsx';
import GroupsPage from './pages/GroupsPage.tsx';
import GroupDetailPage from './pages/GroupDetailPage.tsx';
import AttendancePage from './pages/AttendancePage.tsx';
import StatisticsPage from './pages/StatisticsPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
// import UpdateNotifier from './components/ui/UpdateNotifier.tsx';
import LoginPage from './pages/LoginPage.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <MainLayout>
                    <div className="page-container">
                      <Routes>
                        <Route path="inicio" element={<HomePage />} />
                        <Route path="grupos" element={<GroupsPage />} />
                        <Route path="grupos/:groupId" element={<GroupDetailPage />} />
                        <Route path="asistencia/:groupId" element={<AttendancePage />} />
                        <Route path="estadisticas" element={<StatisticsPage />} />
                        <Route path="configuracion" element={<SettingsPage />} />
                        <Route index element={<Navigate to="/inicio" replace />} />
                        <Route path="*" element={<Navigate to="/inicio" replace />} />
                      </Routes>
                    </div>
                  </MainLayout>
                </ProtectedRoute>
              } />
            </Routes>
            {/* <UpdateNotifier /> */}
          </HashRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;