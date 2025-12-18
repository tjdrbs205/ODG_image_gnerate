import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GalleryPage } from './pages/GalleryPage';
import { GeneratePage } from './pages/GeneratePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { getAccessToken } from './lib/auth';

export default function App() {
  const authed = Boolean(getAccessToken());

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          index
          element={<Navigate to={authed ? '/generate' : '/login'} replace />}
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
