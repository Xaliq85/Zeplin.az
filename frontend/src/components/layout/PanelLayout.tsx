import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useOrderUpdates } from '../../hooks/useOrderUpdates'

export default function PanelLayout() {
  useOrderUpdates()
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
