import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { ArticleEditorPage } from '../features/articles/pages/ArticleEditorPage'
import { ArticlesPage } from '../features/articles/pages/ArticlesPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { PasswordUpdatedPage } from '../features/auth/pages/PasswordUpdatedPage'
import { RecoverPasswordPage } from '../features/auth/pages/RecoverPasswordPage'
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage'
import { VerifyRecoveryCodePage } from '../features/auth/pages/VerifyRecoveryCodePage'
import { SettingsPage } from '../features/settings/pages/SettingsPage'
import { NotFoundPage } from '../features/system/pages/NotFoundPage'
import { SupportEditorPage } from '../features/radar-de-apoio/pages/SupportEditorPage'
import { SupportListPage } from '../features/radar-de-apoio/pages/SupportListPage'
import { UserEditorPage } from '../features/users/pages/UserEditorPage'
import { UserListPage } from '../features/users/pages/UserListPage'
import { PermissionRoute } from './PermissionRoute'

const ArticlePreviewPage = lazy(() =>
  import('../features/articles/pages/ArticlePreviewPage').then((module) => ({ default: module.ArticlePreviewPage })),
)

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PermissionRoute><DashboardPage /></PermissionRoute>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<PermissionRoute><DashboardPage /></PermissionRoute>} />
      <Route path="/artigos" element={<PermissionRoute permission="GESTAO_CONTEUDOS"><ArticlesPage /></PermissionRoute>} />
      <Route
        path="/artigos/preview"
        element={
          <PermissionRoute permission="GESTAO_CONTEUDOS"><Suspense fallback={<div className="min-h-svh bg-surface-soft p-8 font-backoffice text-sm text-muted">Carregando preview...</div>}><ArticlePreviewPage /></Suspense></PermissionRoute>
        }
      />
      <Route path="/artigos/novo" element={<PermissionRoute permission="GESTAO_CONTEUDOS"><ArticleEditorPage /></PermissionRoute>} />
      <Route path="/artigos/:articleId/editar" element={<PermissionRoute permission="GESTAO_CONTEUDOS"><ArticleEditorPage /></PermissionRoute>} />
      <Route path="/radar-de-apoio" element={<PermissionRoute permission="GESTAO_RADAR_APOIO"><SupportListPage /></PermissionRoute>} />
      <Route path="/radar-de-apoio/novo" element={<PermissionRoute permission="GESTAO_RADAR_APOIO"><SupportEditorPage /></PermissionRoute>} />
      <Route path="/radar-de-apoio/:supportId/editar" element={<PermissionRoute permission="GESTAO_RADAR_APOIO"><SupportEditorPage /></PermissionRoute>} />
      <Route path="/usuarios" element={<PermissionRoute permission="GERENCIAR_USUARIOS"><UserListPage /></PermissionRoute>} />
      <Route path="/usuarios/novo" element={<PermissionRoute permission="GERENCIAR_USUARIOS"><UserEditorPage /></PermissionRoute>} />
      <Route path="/usuarios/:userId/editar" element={<PermissionRoute permission="GERENCIAR_USUARIOS"><UserEditorPage /></PermissionRoute>} />
      <Route path="/recuperar-senha" element={<RecoverPasswordPage />} />
      <Route path="/recuperar-senha/codigo" element={<VerifyRecoveryCodePage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      <Route path="/senha-atualizada" element={<PasswordUpdatedPage />} />
      <Route path="/redefinir-senha/sucesso" element={<PasswordUpdatedPage />} />
      <Route path="/configuracoes" element={<PermissionRoute><SettingsPage /></PermissionRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
