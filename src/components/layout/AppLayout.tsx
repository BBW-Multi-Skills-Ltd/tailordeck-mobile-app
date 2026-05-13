import { Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <>
      <AppHeader />
      <main className="page page-with-header">
        <Outlet />
      </main>
      <BottomNav />
    </>
  )
}
