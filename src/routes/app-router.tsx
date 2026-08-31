import { Navigate, Route, Routes } from 'react-router';
import { AppShell } from '@/components/layout/app-shell';
import { AdoptionRequestDetailsPage } from '@/features/adoption-requests/pages/adoption-request-details-page';
import { AdoptionRequestsPage } from '@/features/adoption-requests/pages/adoption-requests-page';
import { AdvertisementDetailsPage } from '@/features/advertisements/pages/advertisement-details-page';
import { AdvertisementsPage } from '@/features/advertisements/pages/advertisements-page';
import { AuditLogPage } from '@/features/audit-log/pages/audit-log-page';
import { LoginPage } from '@/features/auth/login-page';
import { ProtectedRoute } from '@/features/auth/rbac';
import { ContentLandingPage, EditorialDetailsPage, EditorialEditorPage, EditorialListPage } from '@/features/content/pages/content-pages';
import { FaqPage } from '@/features/content/pages/faq-page';
import { DashboardPage } from '@/features/dashboard/dashboard-page';
import { DonationDetailsPage } from '@/features/donations/pages/donation-details-page';
import { DonationsPage } from '@/features/donations/pages/donations-page';
import { FeedingPointDetailsPage } from '@/features/feeding-points/pages/feeding-point-details-page';
import { FeedingPointsPage } from '@/features/feeding-points/pages/feeding-points-page';
import { NotFoundPage, UnauthorizedPage } from '@/features/foundation/pages';
import { OperationsMapPage } from '@/features/map/pages/operations-map-page';
import { NotificationComposePage } from '@/features/notifications/pages/notification-compose-page';
import { NotificationDetailsPage } from '@/features/notifications/pages/notification-details-page';
import { NotificationsPage } from '@/features/notifications/pages/notifications-page';
import { NotificationTemplatesPage } from '@/features/notifications/pages/notification-templates-page';
import { OrganizationDetailsPage } from '@/features/organizations/pages/organization-details-page';
import { OrganizationsPage } from '@/features/organizations/pages/organizations-page';
import { ReportDetailsPage } from '@/features/reports/pages/report-details-page';
import { ReportsPage } from '@/features/reports/pages/reports-page';
import { AdminDetailsPage } from '@/features/settings/pages/admin-details-page';
import { AdminUsersPage } from '@/features/settings/pages/admin-users-page';
import { BackupSettingsPage } from '@/features/settings/pages/backup-settings-page';
import { EmergencyContactsPage } from '@/features/settings/pages/emergency-contacts-page';
import { RoleDetailsPage } from '@/features/settings/pages/role-details-page';
import { RolesPage } from '@/features/settings/pages/roles-page';
import { SettingsLandingPage } from '@/features/settings/pages/settings-landing-page';
import { LocationsPage } from '@/features/settings/pages/locations-page';
import { SupportPage } from '@/features/support/pages/support-page';
import { SupportTicketDetailsPage } from '@/features/support/pages/support-ticket-details-page';
import { UserDetailsPage } from '@/features/users/pages/user-details-page';
import { UsersPage } from '@/features/users/pages/users-page';

export function AppRouter() {
  return (
    <Routes>
      {/* Login stays public while the rest of the dashboard is protected by the shared application shell. */}
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute permission="dashboard:view">
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Reports */}
        <Route
          path="reports"
          element={
            <ProtectedRoute permission="reports:view">
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/:reportId"
          element={
            <ProtectedRoute permission="reports:view">
              <ReportDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Adoption requests */}
        <Route
          path="adoption-requests"
          element={
            <ProtectedRoute permission="adoption:read">
              <AdoptionRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="adoption-requests/:requestId"
          element={
            <ProtectedRoute permission="adoption:read">
              <AdoptionRequestDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Organizations */}
        <Route
          path="organizations"
          element={
            <ProtectedRoute permission="organizations:read">
              <OrganizationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="organizations/:organizationId"
          element={
            <ProtectedRoute permission="organizations:read">
              <OrganizationDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Users */}
        <Route
          path="users"
          element={
            <ProtectedRoute permission="users:read">
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="users/:userId"
          element={
            <ProtectedRoute permission="users:read">
              <UserDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Feeding points */}
        <Route
          path="feeding-points"
          element={
            <ProtectedRoute permission="feeding_points.read">
              <FeedingPointsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="feeding-points/:feedingPointId"
          element={
            <ProtectedRoute permission="feeding_points.read">
              <FeedingPointDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Donations */}
        <Route
          path="donations"
          element={
            <ProtectedRoute permission="donations.read">
              <DonationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="donations/:donationId"
          element={
            <ProtectedRoute permission="donations.read">
              <DonationDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Advertisements */}
        <Route
          path="advertisements"
          element={
            <ProtectedRoute permission="advertisements.read">
              <AdvertisementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="advertisements/:advertisementId"
          element={
            <ProtectedRoute permission="advertisements.read">
              <AdvertisementDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Content management */}
        <Route
          path="content"
          element={
            <ProtectedRoute permission="content.read">
              <ContentLandingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="content/articles"
          element={
            <ProtectedRoute permission="content.read">
              <EditorialListPage kind="ARTICLE" />
            </ProtectedRoute>
          }
        />
        <Route
          path="content/articles/new"
          element={
            <ProtectedRoute permission="content.create">
              <EditorialEditorPage kind="ARTICLE" isNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="content/articles/:articleId"
          element={
            <ProtectedRoute permission="content.read">
              <EditorialDetailsPage kind="ARTICLE" />
            </ProtectedRoute>
          }
        />
        <Route
          path="content/articles/:articleId/edit"
          element={
            <ProtectedRoute permission="content.update">
              <EditorialEditorPage kind="ARTICLE" />
            </ProtectedRoute>
          }
        />

        <Route
          path="content/success-stories"
          element={
            <ProtectedRoute permission="content.read">
              <EditorialListPage kind="SUCCESS_STORY" />
            </ProtectedRoute>
          }
        />
        <Route
          path="content/success-stories/new"
          element={
            <ProtectedRoute permission="content.create">
              <EditorialEditorPage kind="SUCCESS_STORY" isNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="content/success-stories/:storyId"
          element={
            <ProtectedRoute permission="content.read">
              <EditorialDetailsPage kind="SUCCESS_STORY" />
            </ProtectedRoute>
          }
        />
        <Route
          path="content/success-stories/:storyId/edit"
          element={
            <ProtectedRoute permission="content.update">
              <EditorialEditorPage kind="SUCCESS_STORY" />
            </ProtectedRoute>
          }
        />

        <Route
          path="content/awareness"
          element={
            <ProtectedRoute permission="content.read">
              <EditorialListPage kind="AWARENESS" />
            </ProtectedRoute>
          }
        />
        <Route
          path="content/awareness/new"
          element={
            <ProtectedRoute permission="content.create">
              <EditorialEditorPage kind="AWARENESS" isNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="content/awareness/:contentId"
          element={
            <ProtectedRoute permission="content.read">
              <EditorialDetailsPage kind="AWARENESS" />
            </ProtectedRoute>
          }
        />
        <Route
          path="content/awareness/:contentId/edit"
          element={
            <ProtectedRoute permission="content.update">
              <EditorialEditorPage kind="AWARENESS" />
            </ProtectedRoute>
          }
        />

        <Route
          path="content/faq"
          element={
            <ProtectedRoute permission="faq.read">
              <FaqPage />
            </ProtectedRoute>
          }
        />

        {/* Notifications */}
        <Route
          path="notifications"
          element={
            <ProtectedRoute permission="notifications.read">
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications/broadcasts"
          element={
            <ProtectedRoute permission="notifications.read">
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications/new"
          element={
            <ProtectedRoute permission="notifications.create">
              <NotificationComposePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications/templates"
          element={
            <ProtectedRoute permission="notifications.templates.read">
              <NotificationTemplatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications/:notificationId"
          element={
            <ProtectedRoute permission="notifications.read">
              <NotificationDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Operational map */}
        <Route
          path="map"
          element={
            <ProtectedRoute permission="map.read">
              <OperationsMapPage />
            </ProtectedRoute>
          }
        />

        {/* Support */}
        <Route
          path="support"
          element={
            <ProtectedRoute permission="support.read">
              <SupportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="support/:ticketId"
          element={
            <ProtectedRoute permission="support.read">
              <SupportTicketDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Audit log */}
        <Route
          path="audit-log"
          element={
            <ProtectedRoute permission="audit.read">
              <AuditLogPage />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="settings"
          element={
            <ProtectedRoute permission="settings.read">
              <SettingsLandingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings/admin-users"
          element={
            <ProtectedRoute permission="admins.read">
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings/admin-users/:adminId"
          element={
            <ProtectedRoute permission="admins.read">
              <AdminDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings/roles"
          element={
            <ProtectedRoute permission="roles.read">
              <RolesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings/roles/:roleId"
          element={
            <ProtectedRoute permission="roles.read">
              <RoleDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings/locations"
          element={
            <ProtectedRoute permission="settings.read">
              <LocationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings/emergency-contacts"
          element={
            <ProtectedRoute permission="settings.read">
              <EmergencyContactsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings/backups"
          element={
            <ProtectedRoute permission="settings.read">
              <BackupSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Legacy settings entry redirects to the current settings landing page. */}
        <Route path="settings/system" element={<Navigate to="/settings" replace />} />
      </Route>

      {/* Keep unknown routes outside the protected shell so error routing remains predictable. */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}