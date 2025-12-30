import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberPaymentsPage } from './member-payments.page';

describe('MemberPaymentsPage', () => {
  let component: MemberPaymentsPage;
  let fixture: ComponentFixture<MemberPaymentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberPaymentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
