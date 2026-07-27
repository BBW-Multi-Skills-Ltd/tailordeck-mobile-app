export const featureKeys = {
  dashboardAnalytics: 'dashboard_analytics',
  documentSending: 'document_sending',
  fullDocumentSetup: 'full_document_setup',
  pdfExport: 'pdf_export',
} as const

export type FeatureKey = (typeof featureKeys)[keyof typeof featureKeys]
