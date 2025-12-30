import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditMemberPage } from './edit-member.page';

describe('EditMemberPage', () => {
  let component: EditMemberPage;
  let fixture: ComponentFixture<EditMemberPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMemberPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
