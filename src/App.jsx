import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import LocationPage from './pages/LocationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import CustomerDashboard from './pages/CustomerDashboard'
import PostNewJobPage from './pages/PostNewJobPage'
import JobSuccessPage from './pages/JobSuccessPage'
import MyJobsPage from './pages/MyJobsPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import WalletPage from './pages/WalletPage'
import MatePointsPage from './pages/MatePointsPage'
import RewardSuccessPage from './pages/RewardSuccessPage'
import InvoicesPage from './pages/InvoicesPage'
import NotificationSettingsPage from './pages/NotificationSettingsPage'
import HelpSupportPage from './pages/HelpSupportPage'
import LiveChatPage from './pages/LiveChatPage'
import VerifyDocumentsPage from './pages/VerifyDocumentsPage'
import VerificationStatusPage from './pages/VerificationStatusPage'
import AvailabilityPage from './pages/AvailabilityPage'
import PaymentsPayoutsPage from './pages/PaymentsPayoutsPage'
import SetAvailabilityPage from './pages/SetAvailabilityPage'
import SetCleanerLocationPage from './pages/SetCleanerLocationPage'
import SelectServicesPage from './pages/SelectServicesPage'
import CleanerDashboard from './pages/CleanerDashboard'
import CleanerJobsPage from './pages/CleanerJobsPage'
import JobDetailsPage from './pages/JobDetailsPage'
import CleanerChatPage from './pages/CleanerChatPage'
import CustomerJobDetailsPage from './pages/CustomerJobDetailsPage'
import CustomerChatPage from './pages/CustomerChatPage'
import ConfirmYourCleanerPage from './pages/ConfirmYourCleanerPage'
import JobBookedSuccessfullyPage from './pages/JobBookedSuccessfullyPage'
import NotificationPage from './pages/NotificationPage'
import EarningsPage from './pages/EarningsPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/location" element={<LocationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/customer-dashboard" element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />
        <Route path="/post-new-job" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <PostNewJobPage />
          </ProtectedRoute>
        } />
        <Route path="/job-success" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <JobSuccessPage />
          </ProtectedRoute>
        } />
        <Route path="/my-jobs" element={
          <ProtectedRoute>
            <MyJobsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        } />
        <Route path="/rewards" element={
          <ProtectedRoute>
            <MatePointsPage />
          </ProtectedRoute>
        } />
        <Route path="/reward-success" element={
          <ProtectedRoute>
            <RewardSuccessPage />
          </ProtectedRoute>
        } />
        <Route path="/invoices" element={
          <ProtectedRoute>
            <InvoicesPage />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationPage />
          </ProtectedRoute>
        } />
        <Route path="/notifications-settings" element={
          <ProtectedRoute>
            <NotificationSettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/help" element={
          <ProtectedRoute>
            <HelpSupportPage />
          </ProtectedRoute>
        } />
        <Route path="/live-chat" element={
          <ProtectedRoute>
            <LiveChatPage />
          </ProtectedRoute>
        } />
        <Route path="/customer-job-details/:jobId" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <CustomerJobDetailsPage />
          </ProtectedRoute>
        } />
        <Route path="/customer-chat/:jobId" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <CustomerChatPage />
          </ProtectedRoute>
        } />
        <Route path="/confirm-cleaner/:jobId" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <ConfirmYourCleanerPage />
          </ProtectedRoute>
        } />
        <Route path="/booking-confirmation/:jobId" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <JobBookedSuccessfullyPage />
          </ProtectedRoute>
        } />
        <Route path="/verify-documents" element={
          <ProtectedRoute allowedRoles={['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper']}>
            <VerifyDocumentsPage />
          </ProtectedRoute>
        } />
        <Route path="/verification" element={
          <ProtectedRoute allowedRoles={['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper']}>
            <VerificationStatusPage />
          </ProtectedRoute>
        } />
        <Route path="/availability" element={
          <ProtectedRoute allowedRoles={['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper']}>
            <AvailabilityPage />
          </ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute allowedRoles={['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper']}>
            <PaymentsPayoutsPage />
          </ProtectedRoute>
        } />
        <Route path="/set-availability" element={
          <ProtectedRoute allowedRoles={['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper']}>
            <SetAvailabilityPage />
          </ProtectedRoute>
        } />
        <Route path="/set-cleaner-location" element={
          <ProtectedRoute allowedRoles={['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper']}>
            <SetCleanerLocationPage />
          </ProtectedRoute>
        } />
        <Route path="/select-services" element={
          <ProtectedRoute allowedRoles={['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper']}>
            <SelectServicesPage />
          </ProtectedRoute>
        } />
        <Route path="/cleaner-dashboard" element={
          <ProtectedRoute allowedRoles={['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper']}>
            <CleanerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/cleaner-jobs" element={
          <ProtectedRoute allowedRoles={['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper']}>
            <CleanerJobsPage />
          </ProtectedRoute>
        } />
        <Route path="/job-details/:jobId" element={
          <ProtectedRoute allowedRoles={['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper']}>
            <JobDetailsPage />
          </ProtectedRoute>
        } />
        <Route path="/chat/:jobId" element={
          <ProtectedRoute allowedRoles={['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper']}>
            <CleanerChatPage />
          </ProtectedRoute>
        } />
        <Route path="/earnings" element={
          <ProtectedRoute allowedRoles={['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper']}>
            <EarningsPage />
          </ProtectedRoute>
        } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
