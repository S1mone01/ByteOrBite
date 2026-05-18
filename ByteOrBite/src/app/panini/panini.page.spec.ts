import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaniniPage } from './panini.page';

describe('PaniniPage', () => {
  let component: PaniniPage;
  let fixture: ComponentFixture<PaniniPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaniniPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
