import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaniniPage } from './panini.page';

describe('PaniniPage', () => {
  let fixture: ComponentFixture<PaniniPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaniniPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});