import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { UsersListComponent } from './components/users/users-list.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginRedirectGuard } from './guards/login-redirect.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [LoginRedirectGuard] },
  { path: 'users', component: UsersListComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];
