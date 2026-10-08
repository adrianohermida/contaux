import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('contaux-sidebar-collapsed') === 'true'
  })
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('contaux-theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [refreshing, setRefreshing] = useState(false)

  // Sincroniza estado de colapso com o Sidebar
  useEffect(() => {
    const checkCollapsed = () => {
      setSidebarCollapsed(localStorage.getItem('contaux-sidebar-collapsed') === 'true')
    }
    window.addEventListener('storage', checkCollapsed)
    // Polling leve para detectar mudança do próprio botão no mesmo tab
    const interval = setInterval(checkCollapsed, 300)
    return () => {
      window.removeEventListener('storage', checkCollapsed)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('contaux-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const handleRefresh = () => {
    setRefreshing(true)
    window.dispatchEvent(new CustomEvent('app-refresh'))
    setTimeout(() => setRefreshing(false), 800)
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'} style={{ transition: 'padding 0.3s' }}>
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          isDark={isDark}
          onToggleTheme={() => setIsDark((v) => !v)}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
        <main className="p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
