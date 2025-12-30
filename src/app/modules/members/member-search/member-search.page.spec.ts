import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberSearchPage } from './member-search.page';

describe('MemberSearchPage', () => {
  let component: MemberSearchPage;
  let fixture: ComponentFixture<MemberSearchPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
