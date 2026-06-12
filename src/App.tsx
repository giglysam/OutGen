import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { OutGenProvider } from './context/OutGenProvider'
import { AppLayout } from './components/layout/AppLayout'
import { StudioPage } from './components/studio/StudioPage'
import { DesignsPage } from './components/designs/DesignsPage'
import { PrintWizardPage } from './components/print/PrintWizardPage'
import { AccountPage } from './components/account/AccountPage'
import { VisualizePage } from './components/visualize/VisualizePage'

export default function App() {
  return (
    <OutGenProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<StudioPage />} />
            <Route path="designs" element={<DesignsPage />} />
            <Route path="print" element={<PrintWizardPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="visualize" element={<VisualizePage />} />
            <Route path="visualiser" element={<Navigate to="/visualize" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </OutGenProvider>
  )
}
