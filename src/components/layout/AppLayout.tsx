import { Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <>
      <main className="page">
        <AppHeader />
        <Outlet />
      </main>
      <BottomNav />
    </>
  )
}
