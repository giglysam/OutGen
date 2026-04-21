import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { OutGenProvider } from './context/OutGenProvider'
import { AppLayout } from './components/layout/AppLayout'
import { StudioPage } from './components/studio/StudioPage'
import { VisualizePage } from './components/visualize/VisualizePage'
import { AnalyticsPage } from './components/analytics/AnalyticsPage'
import { DistributionPage } from './components/distribution/DistributionPage'

export default function App() {
  return (
    <OutGenProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<StudioPage />} />
            <Route path="visualize" element={<VisualizePage />} />
            <Route path="visualiser" element={<Navigate to="/visualize" replace />} />
            <Route path="stats" element={<AnalyticsPage />} />
            <Route path="distribution" element={<DistributionPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </OutGenProvider>
  )
}
