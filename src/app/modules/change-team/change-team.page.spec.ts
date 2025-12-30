import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeTeamPage } from './change-team.page';

describe('ChangeTeamPage', () => {
  let component: ChangeTeamPage;
  let fixture: ComponentFixture<ChangeTeamPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeTeamPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
