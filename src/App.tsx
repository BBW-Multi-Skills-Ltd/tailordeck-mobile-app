import { Suspense } from 'react'
import { lazyWithReload } from './lib/lazyWithReload'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import AppBootSkeleton from './components/layout/AppBootSkeleton'
import { RouteGuard } from './components/layout/RouteGuard'

const Home = lazyWithReload(() => import('./pages/Home'))
const Clients = lazyWithReload(() => import('./pages/Clients'))
const ClientProfile = lazyWithReload(() => import('./pages/ClientProfile'))
const Jobs = lazyWithReload(() => import('./pages/Jobs'))
const NewJob = lazyWithReload(() => import('./pages/NewJob'))
const JobDetail = lazyWithReload(() => import('./pages/JobDetail'))
const JobMeasurements = lazyWithReload(() => import('./pages/JobMeasurements'))
const Dashboard = lazyWithReload(() => import('./pages/Dashboard'))
const SettingsPage = lazyWithReload(() => import('./pages/Settings'))
const SettingsReminders = lazyWithReload(() => import('./pages/SettingsReminders'))
const SettingsSecurity = lazyWithReload(() => import('./pages/SettingsSecurity'))
const SettingsAbout = lazyWithReload(() => import('./pages/SettingsAbout'))
const SubscriptionPage = lazyWithReload(() => import('./pages/Subscription'))
const ManagePlan = lazyWithReload(() => import('./pages/ManagePlan'))
const BillingCallback = lazyWithReload(() => import('./pages/BillingCallback'))
const AccountStatus = lazyWithReload(() => import('./pages/AccountStatus'))
const More = lazyWithReload(() => import('./pages/More'))
const Business = lazyWithReload(() => import('./pages/Business'))
const Documents = lazyWithReload(() => import('./pages/Documents'))
const Help = lazyWithReload(() => import('./pages/Help'))
const OnboardingWelcome = lazyWithReload(() => import('./pages/OnboardingWelcome'))
const OnboardingSetup = lazyWithReload(() => import('./pages/OnboardingSetup'))
const OnboardingPlan = lazyWithReload(() => import('./pages/OnboardingPlan'))
const SignIn = lazyWithReload(() => import('./pages/SignIn'))
const SignUp = lazyWithReload(() => import('./pages/SignUp'))
const VerifyEmail = lazyWithReload(() => import('./pages/VerifyEmail'))
const ForgotPassword = lazyWithReload(() => import('./pages/ForgotPassword'))
const ResetPassword = lazyWithReload(() => import('./pages/ResetPassword'))
const PrivacyPolicy = lazyWithReload(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazyWithReload(() => import('./pages/TermsOfService'))

function RouteLoadingFallback() {
  return <AppBootSkeleton />
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
            <Route path="/clients/new" element={<Navigate to="/jobs/new" replace />} />
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

