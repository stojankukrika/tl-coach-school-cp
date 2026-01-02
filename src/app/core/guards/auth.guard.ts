// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {StorageService} from "../services/storage.service";
import {AuthConstants} from "../config/auth-constants";

export const authGuard: CanActivateFn = async () => {
  const storage = inject(StorageService);
  const router = inject(Router);
  const token = await storage.get(AuthConstants.TOKEN);

  if (token) {
    return true;
  } else {
    router.navigateByUrl('/sign-in');
    return false;
  }
};
