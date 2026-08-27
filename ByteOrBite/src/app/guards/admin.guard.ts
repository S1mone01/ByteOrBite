import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular/standalone';

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastController = inject(ToastController);

  const user = authService.currentUserValue;

  if (user && user.role === 'admin') {
    return true;
  }

  // Se non è admin, mostra un messaggio e reindirizza alla home
  const toast = await toastController.create({
    message: 'Accesso negato. Questa pagina è riservata agli amministratori.',
    duration: 3000,
    color: 'danger',
    position: 'bottom'
  });
  toast.present();

  return router.parseUrl('/tabs/home');
};
