import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import LocationPage from './pages/customer/LocationPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import PostNewJobPage from './pages/customer/PostNewJobPage'
import JobSuccessPage from './pages/customer/JobSuccessPage'
import MyJobsPage from './pages/customer/MyJobsPage'
import ProfilePage from './pages/profile/ProfilePage'
import EditProfilePage from './pages/profile/EditProfilePage'
import WalletPage from './pages/profile/customer/WalletPage'
import MatePointsPage from './pages/profile/customer/MatePointsPage'
import RewardSuccessPage from './pages/profile/customer/RewardSuccessPage'
import InvoicesPage from './pages/profile/customer/InvoicesPage'
import NotificationSettingsPage from './pages/profile/NotificationSettingsPage'
import HelpSupportPage from './pages/profile/HelpSupportPage'
import LiveChatPage from './pages/profile/LiveChatPage'
import VerifyDocumentsPage from './pages/auth/VerifyDocumentsPage'
import VerificationStatusPage from './pages/profile/cleaner/VerificationStatusPage'
import AvailabilityPage from './pages/profile/cleaner/AvailabilityPage'
import PaymentsPayoutsPage from './pages/profile/cleaner/PaymentsPayoutsPage'
import SetAvailabilityPage from './pages/cleaner/SetAvailabilityPage'
import SetCleanerLocationPage from './pages/cleaner/SetCleanerLocationPage'
import SelectServicesPage from './pages/cleaner/SelectServicesPage'
import CleanerDashboard from './pages/cleaner/CleanerDashboard'
import CleanerJobsPage from './pages/cleaner/CleanerJobsPage' 
import JobDetailsPage from './pages/customer/JobDetailsPage'
import CleanerChatPage from './pages/cleaner/CleanerChatPage'
import CustomerJobDetailsPage from './pages/customer/CustomerJobDetailsPage'
import CustomerChatPage from './pages/customer/CustomerChatPage'
import ConfirmYourCleanerPage from './pages/customer/ConfirmYourCleanerPage'
import JobBookedSuccessfullyPage from './pages/customer/JobBookedSuccessfullyPage'
import NotificationPage from './pages/profile/NotificationPage'
import EarningsPage from './pages/cleaner/EarningsPage'
import InProgressJobDetailsPage from './pages/cleaner/InProgressJobDetailsPage'
import StripeSuccessPage from './pages/StripeSuccessPage'
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
        <Route path="/in-progress-job/:jobId" element={
          <ProtectedRoute allowedRoles={['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper']}>
            <InProgressJobDetailsPage />
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
        <Route path="/cleaner/stripe/success" element={
          <ProtectedRoute allowedRoles={['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper']}>
            <StripeSuccessPage />
          </ProtectedRoute>
        } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
