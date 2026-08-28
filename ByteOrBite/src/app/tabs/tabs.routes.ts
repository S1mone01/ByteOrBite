import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from '../guards/auth.guard';
import { guestGuard } from '../guards/guest.guard';
import { adminGuard } from '../guards/admin.guard';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('../menu/menu.page').then((m) => m.MenuPage),
      },
      {
        path: 'panini',
        loadComponent: () =>
          import('../panini/panini.page').then((m) => m.PaniniPage),
      },
      {
        path: 'starter',
        loadComponent: () =>
          import('../starter/starter.page').then((m) => m.StarterPage),
      },
      {
        path: 'bibite',
        loadComponent: () =>
          import('../bibite/bibite.page').then((m) => m.BibitePage),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('../login/login.page').then((m) => m.LoginPage),
        canActivate: [guestGuard]
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../profile/profile.page').then((m) => m.ProfilePage),
        canActivate: [authGuard]
      },
      {
        path: 'manage',
        loadComponent: () =>
          import('../manage/manage.page').then((m) => m.ManagePage),
        canActivate: [authGuard, adminGuard]
      },
      {
        path: 'riepilogo',
        loadComponent: () =>
          import('../riepilogo/riepilogo.page').then((m) => m.RiepilogoPage),
        canActivate: [authGuard]
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];
