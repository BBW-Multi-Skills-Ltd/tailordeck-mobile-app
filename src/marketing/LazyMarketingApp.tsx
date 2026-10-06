import { lazy } from 'react'

// Browser visitors get the marketing site; it loads as its own bundle so it never adds weight to the app.
const LazyMarketingApp = lazy(() => import('./MarketingApp'))

export default LazyMarketingApp
