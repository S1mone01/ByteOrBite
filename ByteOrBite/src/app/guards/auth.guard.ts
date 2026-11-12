import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular/standalone';

export const authGuard: CanActivateFn = async (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastController = inject(ToastController);

  if (authService.isLoggedIn()) {
    return true;
  }

  const toast = await toastController.create({
    message: state.url.includes('profile')
      ? 'Devi prima effettuare il login per accedere al profilo.'
      : 'Devi prima effettuare il login per accedere.',
    duration: 3000,
    color: 'warning',
    position: 'bottom'
  });
  toast.present();

  return router.parseUrl('/tabs/login');
};
