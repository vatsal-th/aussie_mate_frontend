import './App.css'
import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import { ProtectedRoute, ScrollToTop, Loader } from './components'
import { authRoutes, customerRoutes, cleanerRoutes, CLEANER_ROLES } from './routeGroups'
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<Loader fullscreen message="Hang tight, loading your experience..." />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            {authRoutes.map(({ path, component: Component }, i) => (
              <Route key={i} path={path} element={<Component />} />
            ))}

            {/* Customer protected */}
            {customerRoutes.map(({ path, component: Component, allowedRoles }, i) => (
              <Route
                key={i}
                path={path}
                element={
                  <ProtectedRoute allowedRoles={allowedRoles || ['Customer']}>
                    <Component />
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Cleaner protected */}
            {cleanerRoutes.map(({ path, component: Component, allowedRoles }, i) => (
              <Route
                key={i}
                path={path}
                element={
                  <ProtectedRoute allowedRoles={allowedRoles || CLEANER_ROLES}>
                    <Component />
                  </ProtectedRoute>
                }
              />
            ))}

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App
