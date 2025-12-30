import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberPhotoPage } from './member-photo.page';

describe('MemberPhotoPage', () => {
  let component: MemberPhotoPage;
  let fixture: ComponentFixture<MemberPhotoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberPhotoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
