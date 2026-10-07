import {
  Bell,
  Briefcase,
  ChartLine,
  FileText,
  Ruler,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Wifi,
  type LucideIcon,
} from 'lucide-react'

// Everything editable on the marketing website lives here: copy, links and (later) reviews.

/** Links shown in the footer. Leave a value empty to hide that link/icon until it exists. */
export const marketingLinks = {
  instagram: '',
  facebook: '',
  x: '',
  tiktok: '',
  /** WhatsApp support number in international format without "+", e.g. "2348012345678". */
  whatsappNumber: '',
  founderPage: '',
  companySite: 'https://bbwtechinnovations.com',
  /** App demo video (MP4/YouTube). The hero play button appears once this is set. */
  demoVideo: '',
  /** iPhone app link. While empty, the App Store badge shows "Coming soon" and is not clickable. */
  appStore: '',
}

export type BadgeTone = 'wine' | 'blue' | 'green' | 'amber'

export const productRows: Array<{
  badge: string
  tone: BadgeTone
  title: string
  copy: string
  chips: string[]
  screen: 'job' | 'profit' | 'invoice'
}> = [
  {
    badge: '01 • JOBS',
    tone: 'wine',
    title: 'Every job and measurement in one place',
    copy: 'Create an order for one person, a couple or an entire family. Keep measurements, reference photos and deadlines together, ready whenever they return.',
    chips: ['Single, couple & family orders', 'Works on any Android phone'],
    screen: 'job',
  },
  {
    badge: '02 • PROFIT',
    tone: 'green',
    title: 'Know your profit before you cut',
    copy: 'Add fabric, notions, labour and every other expense. TailorDeck shows the likely profit instantly so you can price with confidence.',
    chips: ['Automatic costing', 'Deposit & balance tracking'],
    screen: 'profit',
  },
  {
    badge: '03 • DOCUMENTS',
    tone: 'blue',
    title: 'Professional invoices and receipts in seconds',
    copy: 'Turn job details into branded documents with your logo and signature, then send them straight to your client.',
    chips: ['PDF export', 'WhatsApp sharing'],
    screen: 'invoice',
  },
]

export const featureGroups: Array<{ label: string; icon: LucideIcon; title: string; copy: string }> = [
  {
    label: 'SHOP SETUP',
    icon: Settings,
    title: 'Your digital shopfront',
    copy: 'Guided onboarding, business profile, address, contact, website, social handles and CAC/RC number, plus logo and signature uploads.',
  },
  {
    label: 'JOBS',
    icon: Briefcase,
    title: 'Every kind of tailoring job',
    copy: 'A 4-step wizard for new stitches or repairs: resize, loosen, replace zips, patch tears, shorten, adjust sleeves and buttons, with the parts needed.',
  },
  {
    label: 'JOBS',
    icon: Users,
    title: 'Orders for everyone',
    copy: 'Single, couple and family orders for adults and children. Men’s, women’s, unisex and custom garments, plus references for each person.',
  },
  {
    label: 'JOBS',
    icon: Sparkles,
    title: 'More than body wear',
    copy: 'Jobs for bedcovers, blankets, duvets, pillow cases and face caps. Save drafts, keep unfinished jobs automatically, and search Draft, Pending or Completed.',
  },
  {
    label: 'MEASUREMENTS',
    icon: Ruler,
    title: 'Measurements that return',
    copy: 'Body measurements for men, women, boys and girls in inches or centimetres, plus item dimensions. Reuse saved measurements for returning clients.',
  },
  {
    label: 'MATERIALS & COSTING',
    icon: Wallet,
    title: 'Know your real profit',
    copy: 'Track local or foreign material, colour, yards, quality and who provides it. Add your charge, deposit, balance and expenses for an automatic profit check.',
  },
  {
    label: 'DEADLINES',
    icon: Bell,
    title: 'Never miss a delivery',
    copy: 'Set the date and time with reminders from 10 minutes to a week before, or custom. Push alerts, sound, vibration, exact alarms and an in-app notification centre.',
  },
  {
    label: 'CLIENTS',
    icon: Users,
    title: 'Client history, automatically',
    copy: 'Clients are saved from your jobs with phone, measurements and job history. Start another job for a returning client in one tap.',
  },
  {
    label: 'DOCUMENTS',
    icon: FileText,
    title: 'Invoices that look professional',
    copy: 'Branded invoices and receipts with your logo, signature and business details. Preview, zoom, export to PDF and share to clients on WhatsApp.',
  },
  {
    label: 'DASHBOARD',
    icon: ChartLine,
    title: 'See how business is moving',
    copy: 'Revenue, expenses, profit, job status breakdown, best month, monthly table and chart, plus this month’s summary and recent jobs on Home.',
  },
  {
    label: 'PLANS & ACCOUNT',
    icon: ShieldCheck,
    title: 'Secure and in your control',
    copy: 'Free, Starter and Pro through Google Play, monthly or yearly. Email-code login and password reset, dark mode, deactivation and account deletion.',
  },
  {
    label: 'HELP & RELIABILITY',
    icon: Wifi,
    title: 'Ready when you need it',
    copy: 'Works on weak connections with an offline indicator. Your data is private to your account, and in-app support covers billing, bugs, account help and feedback.',
  },
]

export const journey = [
  'Download TailorDeck from Google Play',
  'Create your account with email code verification',
  'Set up your shop: name, logo, signature and contact',
  'Start your free 14-day full trial',
  'Create a job: client, measurements, item and photos',
  'Add materials, price and deposit, and see your profit',
  'Set the delivery date and reminder',
  'Send the invoice to your client',
  'Get reminded, complete the job and issue a receipt',
  'Track revenue and profit on your dashboard',
]

/**
 * Real customer reviews only. While this is empty the section shows a "reviews coming soon" note.
 * Example: { initials: 'AM', name: 'Amaka M.', shop: 'Amaka Stitches', city: 'Lagos', quote: '…' }
 */
export const testimonials: Array<{ initials: string; name: string; shop: string; city: string; quote: string }> = []
