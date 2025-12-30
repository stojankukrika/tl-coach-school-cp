import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MembershipsStatusesPage } from './memberships-statuses.page';

describe('MembershipsStatusesPage', () => {
  let component: MembershipsStatusesPage;
  let fixture: ComponentFixture<MembershipsStatusesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MembershipsStatusesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
