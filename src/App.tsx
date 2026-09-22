import { useState } from 'react'
import { Layout } from './components/Layout/Layout'
import { AboutPage } from './pages/AboutPage'
import { GardenPage } from './pages/GardenPage'
import { HistoryPage } from './pages/HistoryPage'
import { HomePage } from './pages/HomePage'
import { TasksPage } from './pages/TasksPage'
import type { AppPage } from './types'

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home')

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'tasks' && <TasksPage />}
      {currentPage === 'garden' && <GardenPage />}
      {currentPage === 'history' && <HistoryPage />}
      {currentPage === 'about' && <AboutPage />}
    </Layout>
  )
}

export default App
