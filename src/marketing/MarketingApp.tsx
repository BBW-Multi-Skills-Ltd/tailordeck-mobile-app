import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import LandingPage from './LandingPage'
import './marketing.css'

const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('../pages/TermsOfService'))
const DeleteAccountPage = lazy(() => import('./DeleteAccountPage'))
const OpenInAppPage = lazy(() => import('./OpenInAppPage'))
// Admin area: its own bundle, only downloaded when /admin is opened.
const AdminApp = lazy(() => import('../admin/AdminApp'))

/**
 * The public website (browsers). TailorDeck itself runs in the Android app; this site markets it and hosts the
 * pages Google Play requires: privacy policy, terms and account deletion. /admin is the team's admin area.
 */
export default function MarketingApp() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<div className="mk-page-loading" aria-hidden />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route
        path="*"
        element={
          <MarketingLayout>
            <Suspense fallback={<div className="mk-page-loading" aria-hidden />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/delete-account" element={<DeleteAccountPage />} />
                {/* Old email links (e.g. password reset) now point people to the app. */}
                <Route path="/auth/*" element={<OpenInAppPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </MarketingLayout>
        }
      />
    </Routes>
  )
}
