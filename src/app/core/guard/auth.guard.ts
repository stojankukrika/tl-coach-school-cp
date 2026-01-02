import { NavController } from "@ionic/angular";
import {AuthService} from "../services/auth.service";
import {Injectable} from "@angular/core";
import {map, Observable} from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthGuard {

  constructor(
    private auth: AuthService,
    private navCtrl: NavController
  ) {}

  canActivate(): Observable<boolean> {
    return this.auth.userData$.pipe(
      map(user => {
        if (!user) {
          this.navCtrl.navigateRoot('/sign-in', { animated: false });
          return false;
        }
        return true;
      })
    );
  }
}
