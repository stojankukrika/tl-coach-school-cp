import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { GroupMemberService } from 'src/app/core/services/group-member.service';
import { ToastService } from 'src/app/core/services/toast.service';

// Modern Capacitor Camera Imports
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-member-photo',
  templateUrl: './member-photo.page.html',
  styleUrls: ['./member-photo.page.scss'],
  standalone: false,
})
export class MemberPhotoPage implements OnInit {
  // --- Services Injected ---
  private activatedRoute = inject(ActivatedRoute);
  private groupMemberService = inject(GroupMemberService);
  private toastService = inject(ToastService);
  private navCtrl = inject(NavController);

  // --- Signals & State ---
  public teamMember: WritableSignal<any | null> = signal(null);
  public memberId: WritableSignal<string | null> = signal(null);
  
  // UI Flags
  public isLoading: WritableSignal<boolean> = signal(true);
  public isSubmitting: WritableSignal<boolean> = signal(false);

  constructor() {}

  ngOnInit(): void {}

  async ionViewWillEnter() {
    this.isLoading.set(true);
    
    this.activatedRoute.params.subscribe(params => {
      const id = params['id'] ?? null;
      this.memberId.set(id);
      this.loadMemberData(id);
    });
  }

  /** Fetches current member data to show existing photo/avatar */
  private loadMemberData(id: string) {
    if (!id) return;
    this.groupMemberService.show({ id }).subscribe({
      next: (data) => {
        this.teamMember.set(data.team_member);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  /** Capacitor 6 Camera Implementation */
  pickImage = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        saveToGallery: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt, // Allows User to choose between Camera or Photos
        width: 1024,
        height: 1024,
      });

      // Update signal immutably
      this.teamMember.update(member => ({
        ...member,
        photo: `data:image/jpeg;base64,${image.base64String}`,
        avatar: null // Clear existing avatar to show the new photo preview
      }));
    } catch (error) {
      console.warn('User cancelled or camera error', error);
    }
  }

  /** Saves the new photo via API */
  save() {
    const memberData = this.teamMember();
    if (!memberData) return;

    this.isSubmitting.set(true);
    
    this.groupMemberService.updatePhoto(memberData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.navCtrl.pop();
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.toastService.presentToast(err.error?.message || 'Error updating photo');
      }
    });
  }
}