import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberChangeGroupsPage } from './member-change-groups.page';

describe('MemberChangeGroupsPage', () => {
  let component: MemberChangeGroupsPage;
  let fixture: ComponentFixture<MemberChangeGroupsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberChangeGroupsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
