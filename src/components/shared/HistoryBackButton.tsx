import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type HistoryBackButtonProps = {
  fallbackTo?: string
  label?: string
}

export default function HistoryBackButton({ fallbackTo = '/', label = 'Go back' }: HistoryBackButtonProps) {
  const navigate = useNavigate()

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate(fallbackTo)
  }

  return (
    <button type="button" className="btn btn-ghost btn-icon" aria-label={label} onClick={goBack}>
      <ArrowLeft size={18} />
    </button>
  )
}
