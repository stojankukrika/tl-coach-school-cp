import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PresenceTablePage } from './presence-table.page';

describe('PresenceTablePage', () => {
  let component: PresenceTablePage;
  let fixture: ComponentFixture<PresenceTablePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PresenceTablePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
