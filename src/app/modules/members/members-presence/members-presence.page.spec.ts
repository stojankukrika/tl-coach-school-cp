import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MembersPresencePage } from './members-presence.page';

describe('MembersPresencePage', () => {
  let component: MembersPresencePage;
  let fixture: ComponentFixture<MembersPresencePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersPresencePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
