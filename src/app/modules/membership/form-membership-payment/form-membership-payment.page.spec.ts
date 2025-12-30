import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormMembershipPaymentPage } from './form-membership-payment.page';

describe('FormMembershipPaymentPage', () => {
  let component: FormMembershipPaymentPage;
  let fixture: ComponentFixture<FormMembershipPaymentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FormMembershipPaymentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
