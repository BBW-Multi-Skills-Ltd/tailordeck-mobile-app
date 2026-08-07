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
const SettingsReminders = lazy(() => import('./pages/SettingsReminders'))
const SettingsSecurity = lazy(() => import('./pages/SettingsSecurity'))
const SettingsAbout = lazy(() => import('./pages/SettingsAbout'))
const SubscriptionPage = lazy(() => import('./pages/Subscription'))
const ManagePlan = lazy(() => import('./pages/ManagePlan'))
const BillingCallback = lazy(() => import('./pages/BillingCallback'))
const AccountStatus = lazy(() => import('./pages/AccountStatus'))
const More = lazy(() => import('./pages/More'))
const Business = lazy(() => import('./pages/Business'))
const Documents = lazy(() => import('./pages/Documents'))
const Help = lazy(() => import('./pages/Help'))
const OnboardingWelcome = lazy(() => import('./pages/OnboardingWelcome'))
const OnboardingSetup = lazy(() => import('./pages/OnboardingSetup'))
const OnboardingPlan = lazy(() => import('./pages/OnboardingPlan'))
const SignIn = lazy(() => import('./pages/SignIn'))
const SignUp = lazy(() => import('./pages/SignUp'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))

function RouteLoadingFallback() {
  return (
    <main className="page-full route-guard-loading">
      <img src="/branding/TailorDeck%20app%20logo%20for%20splac%20screen.png" alt="TailorDeck" />
      <p>Getting things ready...</p>
    </main>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/onboarding" element={<OnboardingWelcome />} />
        <Route path="/onboarding/setup" element={<OnboardingSetup />} />
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/forgot" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        <Route element={<RouteGuard />}>
          <Route path="/account-status" element={<AccountStatus />} />
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
            <Route path="/profile" element={<Navigate to="/settings/security" replace />} />
            <Route path="/business" element={<Business />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/help" element={<Help />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/reminders" element={<SettingsReminders />} />
            <Route path="/settings/security" element={<SettingsSecurity />} />
            <Route path="/settings/about" element={<SettingsAbout />} />
            <Route path="/settings/subscription" element={<SubscriptionPage />} />
            <Route path="/settings/subscription/manage" element={<ManagePlan />} />
            <Route path="/billing/callback" element={<BillingCallback />} />
            <Route path="/more" element={<More />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    </Suspense>
  )
}
