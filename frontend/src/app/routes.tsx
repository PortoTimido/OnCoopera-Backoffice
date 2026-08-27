import { Route, Routes } from 'react-router-dom'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { PasswordUpdatedPage } from '../features/auth/pages/PasswordUpdatedPage'
import { RecoverPasswordPage } from '../features/auth/pages/RecoverPasswordPage'
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage'
import { CreateAdministratorPage } from '../features/settings/pages/CreateAdministratorPage'
import { SettingsPage } from '../features/settings/pages/SettingsPage'
import { NotFoundPage } from '../features/system/pages/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/recuperar-senha" element={<RecoverPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      <Route path="/senha-atualizada" element={<PasswordUpdatedPage />} />
      <Route path="/redefinir-senha/sucesso" element={<PasswordUpdatedPage />} />
      <Route path="/configuracoes" element={<SettingsPage />} />
      <Route path="/configuracoes/administradores/novo" element={<CreateAdministratorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
