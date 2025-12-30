import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupMembershipPage } from './group-membership.page';

describe('GroupMembershipPage', () => {
  let component: GroupMembershipPage;
  let fixture: ComponentFixture<GroupMembershipPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupMembershipPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
