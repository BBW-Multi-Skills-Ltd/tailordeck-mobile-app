import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { RouteGuard } from './components/layout/RouteGuard'

const Home = lazy(() => import('./pages/Home'))
const Clients = lazy(() => import('./pages/Clients'))
const NewClient = lazy(() => import('./pages/NewClient'))
const ClientProfile = lazy(() => import('./pages/ClientProfile'))
const Jobs = lazy(() => import('./pages/Jobs'))
const NewJob = lazy(() => import('./pages/NewJob'))
const JobDetail = lazy(() => import('./pages/JobDetail'))
const JobMeasurements = lazy(() => import('./pages/JobMeasurements'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const SettingsPage = lazy(() => import('./pages/Settings'))
const SubscriptionPage = lazy(() => import('./pages/Subscription'))
const OnboardingWelcome = lazy(() => import('./pages/OnboardingWelcome'))
const OnboardingSetup = lazy(() => import('./pages/OnboardingSetup'))
const OnboardingPlan = lazy(() => import('./pages/OnboardingPlan'))
const SignIn = lazy(() => import('./pages/SignIn'))
const SignUp = lazy(() => import('./pages/SignUp'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))

function RouteLoadingFallback() {
  return (
    <main className="app-shell">
      <div className="app-main">
        <section className="section stack gap-12">
          <div className="skeleton" style={{ height: 34, width: '54%' }} />
          <div className="skeleton" style={{ height: 92 }} />
          <div className="skeleton" style={{ height: 92 }} />
        </section>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/onboarding" element={<OnboardingWelcome />} />
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/forgot" element={<ForgotPassword />} />

        <Route element={<RouteGuard />}>
          <Route path="/onboarding/setup" element={<OnboardingSetup />} />
          <Route path="/onboarding/plan" element={<OnboardingPlan />} />
          <Route element={<AppLayout />}>
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
        </Route>

        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    </Suspense>
  )
}
