import { BarChart3, BriefcaseBusiness, PlusCircle, TrendingUp } from 'lucide-react'

export default function DashboardEmptyGuide() {
  return (
    <article className="dashboard-empty-guide card stack gap-12">
      <div className="dashboard-empty-icon">
        <BarChart3 size={22} />
      </div>
      <div className="stack gap-4">
        <h2>Your analytics will unlock as you work</h2>
        <p>Create jobs with pricing and expenses. TailorDeck will turn them into revenue, profit, and status insights automatically.</p>
      </div>
      <div className="dashboard-empty-steps">
        <span>
          <BriefcaseBusiness size={14} />
          Create jobs
        </span>
        <span>
          <TrendingUp size={14} />
          Track expenses
        </span>
        <span>
          <BarChart3 size={14} />
          View profit
        </span>
      </div>
      <p className="dashboard-empty-hint">
        <PlusCircle size={14} />
        Use the center plus button to create your first job.
      </p>
    </article>
  )
}
