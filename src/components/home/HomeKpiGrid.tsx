import { motion } from 'framer-motion'
import type { getHomeKpiCards } from './homeMetrics'

type HomeKpiGridProps = {
  cards: ReturnType<typeof getHomeKpiCards>
}

export function HomeKpiGrid({ cards }: HomeKpiGridProps) {
  return (
    <motion.div className="kpi-grid" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <motion.article key={card.label} className="stat-card card-3d" variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
            <Icon size={20} className="text-primary" />
            <p className="stat-label mt-8">{card.label}</p>
            <p className="stat-value">{card.value}</p>
          </motion.article>
        )
      })}
    </motion.div>
  )
}
