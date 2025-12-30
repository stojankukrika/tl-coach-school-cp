import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileAvatarPage } from './profile-avatar.page';

describe('ProfileAvatarPage', () => {
  let component: ProfileAvatarPage;
  let fixture: ComponentFixture<ProfileAvatarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileAvatarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
