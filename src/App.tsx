import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Home from './pages/Home'
import Clients from './pages/Clients'
import NewClient from './pages/NewClient'
import ClientProfile from './pages/ClientProfile'
import Jobs from './pages/Jobs'
import NewJob from './pages/NewJob'
import JobDetail from './pages/JobDetail'
import JobMeasurements from './pages/JobMeasurements'
import Dashboard from './pages/Dashboard'
import SettingsPage from './pages/Settings'
import SubscriptionPage from './pages/Subscription'
import Onboarding from './pages/Onboarding'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

function hasAuthPreviewSession() {
  return window.localStorage.getItem('tailordeck-auth-preview') !== null
}

export default function App() {
  const isAuthed = hasAuthPreviewSession()

  return (
    <Routes>
      <Route path="/auth/signin" element={isAuthed ? <Navigate to="/" replace /> : <SignIn />} />
      <Route path="/auth/signup" element={isAuthed ? <Navigate to="/" replace /> : <SignUp />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={isAuthed ? <AppLayout /> : <Navigate to="/auth/signin" replace />}>
        <Route path="/" element={<Home />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/new" element={<NewClient />} />
        <Route path="/clients/:id" element={<ClientProfile />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/new" element={<NewJob />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/jobs/:id/measurements" element={<JobMeasurements />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/subscription" element={<SubscriptionPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthed ? '/' : '/auth/signin'} replace />} />
    </Routes>
  )
}
