import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MembersNotePage } from './members-note.page';

describe('MembersNotePage', () => {
  let component: MembersNotePage;
  let fixture: ComponentFixture<MembersNotePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersNotePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
