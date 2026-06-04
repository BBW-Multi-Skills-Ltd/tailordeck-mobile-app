import { motion } from 'framer-motion'
import { HiOutlineArrowTrendingUp } from 'react-icons/hi2'

type HomeProfitCardProps = {
  profit: string
  onOpenDashboard: () => void
}

export function HomeProfitCard({ profit, onOpenDashboard }: HomeProfitCardProps) {
  return (
    <motion.article
      className="home-profit-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      role="button"
      tabIndex={0}
      onClick={onOpenDashboard}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        onOpenDashboard()
      }}
    >
      <p className="home-profit-label">Total Profit</p>
      <div className="home-profit-row">
        <p className="home-profit-value">{profit}</p>
        <HiOutlineArrowTrendingUp size={28} className="home-profit-trend" />
      </div>
    </motion.article>
  )
}
