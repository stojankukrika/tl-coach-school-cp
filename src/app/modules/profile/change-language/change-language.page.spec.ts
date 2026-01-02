import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeLanguagePage } from './change-language.page';

describe('ChangeLanguagePage', () => {
  let component: ChangeLanguagePage;
  let fixture: ComponentFixture<ChangeLanguagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeLanguagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
