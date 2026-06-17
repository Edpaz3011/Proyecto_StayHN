import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LandingComponent } from './components/landing/landing.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { GuestDashboardComponent } from './components/guest-dashboard/guest-dashboard.component';
import { GuestSearchComponent } from './components/guest-search/guest-search.component';
import { GuestBookComponent } from './components/guest-book/guest-book.component';
import { PagePlaceholderComponent } from './components/page-placeholder/page-placeholder.component';
// guest components (already imported above)
import { AdminAccommodationsComponent } from './components/admin-accommodations/admin-accommodations.component';
import { AdminReservationsComponent } from './components/admin-reservations/admin-reservations.component';
import { AdminGuestsComponent } from './components/admin-guests/admin-guests.component';
import { AdminReportsComponent } from './components/admin-reports/admin-reports.component';
import { AdminQuestionsComponent } from './components/admin-questions/admin-questions.component';
import { GuestReservationsComponent } from './components/guest-reservations/guest-reservations.component';
import { GuestReviewsComponent } from './components/guest-reviews/guest-reviews.component';
import { GuestProfileComponent } from './components/guest-profile/guest-profile.component';
import { AccommodationListComponent } from './components/accommodation-list/accommodation-list.component';
import { AccommodationDetailComponent } from './components/accommodation-detail/accommodation-detail.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: 'guest', component: GuestDashboardComponent, canActivate: [AuthGuard] },
  { path: 'guest/search', component: GuestSearchComponent, canActivate: [AuthGuard] },
  { path: 'accommodations', component: AccommodationListComponent },
  { path: 'accommodation/:id', component: AccommodationDetailComponent },
  { path: 'guest/book/:id', component: GuestBookComponent, canActivate: [AuthGuard] },
  { path: 'guest/reservations', component: GuestReservationsComponent, canActivate: [AuthGuard] },
  { path: 'guest/reviews', component: GuestReviewsComponent, canActivate: [AuthGuard] },
  { path: 'guest/profile', component: GuestProfileComponent, canActivate: [AuthGuard] },
  { path: 'admin/accommodations', component: AdminAccommodationsComponent, canActivate: [AdminGuard] },
  { path: 'admin/reservations', component: AdminReservationsComponent, canActivate: [AdminGuard] },
  { path: 'admin/questions', component: AdminQuestionsComponent, canActivate: [AdminGuard] },
  { path: 'admin/guests', component: AdminGuestsComponent, canActivate: [AdminGuard] },
  { path: 'admin/reports', component: AdminReportsComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '' }
];
