import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthConstants } from 'src/app/core/config/auth-constants';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-profile-avatar',
  templateUrl: './profile-avatar.page.html',
  styleUrls: ['./profile-avatar.page.scss'],
standalone:false
})
export class ProfileAvatarPage implements OnInit {

  show = signal(false);
  // --- Dependency Injection using `inject` ---
  public translate = inject(TranslateService);
  private authService = inject(AuthService);
  private navCtrl = inject(NavController);
  public toastService = inject(ToastService);

  // --- State as Writable Signals ---
  showForm: WritableSignal<boolean> = signal(false);
  user: WritableSignal<any | null> = signal(null);
  clicked: WritableSignal<boolean> = signal(false);

  // --- Constructor ---
  constructor() {
    // Initial state for clicked is handled by the signal declaration
  }

  // --- Lifecycle Hooks ---
  ngOnInit() {
    this.showForm.set(false);
    
    // Load user data from local storage
    const userString = localStorage.getItem(AuthConstants.AUTH);
    if (userString) {
      const userData = JSON.parse(userString);
      // Ensure photo is null initially, as per original logic
      this.user.set({ ...userData, photo: null } as any); 
    } else {
      this.user.set({ photo: null } as any);
    }
    setTimeout(() => {
      this.show.set(true);
    }, 500);
  }

  // --- Public Methods ---

  pickImage = async (): Promise<void> => {
    // Check if running on a non-web platform for the Camera plugin
    if (Capacitor.getPlatform() === 'web') {
      console.error("Camera plugin is not implemented for web platform");
      alert(this.translate.instant("camera_web_not_supported"));
      return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        saveToGallery: false, // Changed from true in original, safer default
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt, // Prompt user to choose between library or camera
        correctOrientation: true,
        width: 1024,
        height: 1024,
      });
      
      const photoBase64 = `data:image/jpeg;base64,${image.base64String}`;
      
      // Update the photo property within the user signal
      this.user.update(u => ({ ...u!, photo: photoBase64 }));

    } catch (error) {
      console.error("Error taking photo:", error);
      this.toastService.presentToast(this.translate.instant("error_taking_photo"));
    }
  }

  save() {
    this.clicked.set(true);
    const currentUser = this.user();

    if (!currentUser || !currentUser.photo) {
      this.clicked.set(false);
      this.toastService.presentToast(this.translate.instant('no_photo_selected'));
      return;
    }

    this.authService.updatePhoto(currentUser).subscribe({
      next: () => {
        // Fetch fresh user info after updating the photo
        this.authService.info().subscribe({
          next: (data: any) => {
            localStorage.setItem(AuthConstants.AUTH, JSON.stringify(data));
            this.clicked.set(false);
            this.navCtrl.pop();
          },
          error: (data: any) => {
            this.clicked.set(false);
            this.toastService.presentToast(this.translate.instant(data?.error?.message || 'info_fetch_error'));
          }
        });
      },
      error: (data: any) => {
        this.clicked.set(false);
        this.toastService.presentToast(this.translate.instant(data?.error?.message || 'photo_update_error'));
      }
    });
  }

  back() {
    this.navCtrl.pop();
  }
}
