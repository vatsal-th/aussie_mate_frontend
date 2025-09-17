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
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/post-new-job" element={<PostNewJobPage />} />
        <Route path="/job-success" element={<JobSuccessPage />} />
        <Route path="/my-jobs" element={<MyJobsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/rewards" element={<MatePointsPage />} />
        <Route path="/reward-success" element={<RewardSuccessPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/notifications" element={<NotificationSettingsPage />} />
        <Route path="/help" element={<HelpSupportPage />} />
        <Route path="/live-chat" element={<LiveChatPage />} />
        <Route path="/verify-documents" element={<VerifyDocumentsPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
