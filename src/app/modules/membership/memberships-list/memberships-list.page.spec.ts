import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MembershipsListPage } from './memberships-list.page';

describe('MembershipsListPage', () => {
  let component: MembershipsListPage;
  let fixture: ComponentFixture<MembershipsListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MembershipsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
