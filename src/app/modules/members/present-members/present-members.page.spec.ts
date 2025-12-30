import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PresentMembersPage } from './present-members.page';

describe('PresentMembersPage', () => {
  let component: PresentMembersPage;
  let fixture: ComponentFixture<PresentMembersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PresentMembersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
