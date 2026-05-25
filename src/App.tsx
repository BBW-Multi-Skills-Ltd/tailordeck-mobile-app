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
import OnboardingWelcome from './pages/OnboardingWelcome'
import OnboardingSetup from './pages/OnboardingSetup'
import OnboardingPlan from './pages/OnboardingPlan'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import { getOnboardingStage, isOnboardingCompleted, isPreviewAuthenticated } from './lib/auth'

export default function App() {
  const isAuthed = isPreviewAuthenticated()
  const isOnboarded = isOnboardingCompleted()
  const onboardingStage = getOnboardingStage()

  return (
    <Routes>
      <Route path="/onboarding" element={isAuthed ? <Navigate to={isOnboarded ? '/' : onboardingStage === 'plan' ? '/onboarding/plan' : '/onboarding/setup'} replace /> : <OnboardingWelcome />} />
      <Route path="/auth/signin" element={isAuthed ? <Navigate to={isOnboarded ? '/' : onboardingStage === 'plan' ? '/onboarding/plan' : '/onboarding/setup'} replace /> : <SignIn />} />
      <Route path="/auth/signup" element={isAuthed ? <Navigate to={isOnboarded ? '/' : onboardingStage === 'plan' ? '/onboarding/plan' : '/onboarding/setup'} replace /> : <SignUp />} />
      <Route path="/auth/forgot" element={isAuthed ? <Navigate to={isOnboarded ? '/' : onboardingStage === 'plan' ? '/onboarding/plan' : '/onboarding/setup'} replace /> : <ForgotPassword />} />
      <Route path="/onboarding/setup" element={isAuthed ? (isOnboarded ? <Navigate to="/" replace /> : <OnboardingSetup />) : <Navigate to="/auth/signup" replace />} />
      <Route path="/onboarding/plan" element={isAuthed ? (isOnboarded ? <Navigate to="/" replace /> : <OnboardingPlan />) : <Navigate to="/auth/signup" replace />} />
      <Route element={isAuthed ? (isOnboarded ? <AppLayout /> : <Navigate to={onboardingStage === 'plan' ? '/onboarding/plan' : '/onboarding/setup'} replace />) : <Navigate to="/onboarding" replace />}>
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
      <Route path="*" element={<Navigate to={isAuthed ? (isOnboarded ? '/' : onboardingStage === 'plan' ? '/onboarding/plan' : '/onboarding/setup') : '/onboarding'} replace />} />
    </Routes>
  )
}
