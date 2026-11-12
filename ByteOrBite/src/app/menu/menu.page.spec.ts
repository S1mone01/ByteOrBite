import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuPage } from './menu.page';

describe('MenuPage', () => {
  let fixture: ComponentFixture<MenuPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});