import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full'
  },
  {
    path: 'add-member',
    loadChildren: () => import('./modules/members/add-member/add-member.module').then( m => m.AddMemberPageModule)
  },
  {
    path: 'member-edit/:id',
    loadChildren: () => import('./modules/members/edit-member/edit-member.module').then( m => m.EditMemberPageModule)
  },
  {
    path: 'member_payments',
    loadChildren: () => import('./modules/members/member-payments/member-payments.module').then( m => m.MemberPaymentsPageModule)
  },
  {
    path: 'member-change-groups/:member',
    loadChildren: () => import('./modules/members/member-change-groups/member-change-groups.module').then( m => m.MemberChangeGroupsPageModule)
  },
  {
    path: 'member-details/:id',
    loadChildren: () => import('./modules/members/member-details/member-details.module').then( m => m.MemberDetailsPageModule)
  },
  {
    path: 'member-photo/:id',
    loadChildren: () => import('./modules/members/member-photo/member-photo.module').then( m => m.MemberPhotoPageModule)
  },
  {
    path: 'members-presence',
    loadChildren: () => import('./modules/members/members-presence/members-presence.module').then( m => m.MembersPresencePageModule)
  },
  {
    path: 'note-members/:time/:order',
    loadChildren: () => import('./modules/members/members-note/members-note.module').then( m => m.MembersNotePageModule)
  },
  {
    path: 'search-member',
    loadChildren: () => import('./modules/members/member-search/member-search.module').then( m => m.MemberSearchPageModule)
  },
  {
    path: 'sign-in',
    loadChildren: () => import('./modules/auth/sign-in/sign-in.module').then( m => m.SignInPageModule)
  },
  {
    path: 'password-reset',
    loadChildren: () => import('./modules/auth/password-reset/password-reset.module').then( m => m.PasswordResetPageModule)
  },
  {
    path: 'measurements/:time',
    loadChildren: () => import('./modules/measurements/measurements.module').then( m => m.MeasurementsPageModule)
  },
  {
    path: 'measurements/:time/:event',
    loadChildren: () => import('./modules/measurements/measurements.module').then( m => m.MeasurementsPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./modules/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'memberships-list',
    loadChildren: () => import('./modules/membership/memberships-list/memberships-list.module').then( m => m.MembershipsListPageModule)
  },
  {
    path: 'memberships-statuses',
    loadChildren: () => import('./modules/membership/memberships-statuses/memberships-statuses.module').then( m => m.MembershipsStatusesPageModule)
  },
  {
    path: 'membership-payment/:member/create',
    loadChildren: () => import('./modules/membership/form-membership-payment/form-membership-payment.module').then( m => m.FormMembershipPaymentPageModule)
  },
  {
    path: 'memberships',
    loadChildren: () => import('./modules/membership/group-membership/group-membership.module').then( m => m.GroupMembershipPageModule)
  },
  {
    path: 'training-plan/:id/:order',
    loadChildren: () => import('./modules/training/training-plan/training-plan.module').then( m => m.TrainingPlanPageModule)
  },
  {
    path: 'training-calendars',
    loadChildren: () => import('./modules/training/training-calendars/training-calendars.module').then( m => m.TrainingCalendarsPageModule)
  },
  {
    path: 'training-calendar-video/:id',
    loadChildren: () => import('./modules/training/training-calendar-video/training-calendar-video.module').then( m => m.TrainingCalendarVideoPageModule)
  },
  {
    path: 'training-calendar-result/:id',
    loadChildren: () => import('./modules/training/training-calendar-result/training-calendar-result.module').then( m => m.TrainingCalendarResultPageModule)
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('./modules/profile/edit-profile/edit-profile.module').then( m => m.EditProfilePageModule)
  },
  {
    path: 'profile-avatar',
    loadChildren: () => import('./modules/profile/profile-avatar/profile-avatar.module').then( m => m.ProfileAvatarPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./modules/notifications/notifications-list/notifications-list.module').then( m => m.NotificationsListPageModule)
  },
  {
    path: 'notification/:id',
    loadChildren: () => import('./modules/notifications/notification-details/notification-details.module').then( m => m.NotificationDetailsPageModule)
  },
  {
    path: 'present-members/:time/:order',
    loadChildren: () => import('./modules/members/present-members/present-members.module').then( m => m.PresentMembersPageModule)
  },
  {
    path: 'present-members/:time/:event',
    loadChildren: () => import('./modules/members/present-members/present-members.module').then( m => m.PresentMembersPageModule)
  },
  {
    path: 'contact-us',
    loadChildren: () => import('./modules/contact-us/contact-us.module').then( m => m.ContactUsPageModule)
  },
  {
    path: 'statistic/:id',
    loadChildren: () => import('./modules/statistic/statistic.module').then( m => m.StatisticPageModule)
  },
  {
    path: 'change-language',
    loadChildren: () => import('./modules/change-language/change-language.module').then( m => m.ChangeLanguagePageModule)
  },
  {
    path: 'change-team',
    loadChildren: () => import('./modules/change-team/change-team.module').then( m => m.ChangeTeamPageModule)
  },
  {
    path: 'table-presence/:id',
    loadChildren: () => import('./modules/presence-table/presence-table.module').then( m => m.PresenceTablePageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
