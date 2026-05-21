import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RiepilogoPage } from './riepilogo.page';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule } from '@ionic/angular';

describe('RiepilogoPage', () => {
  let component: RiepilogoPage;
  let fixture: ComponentFixture<RiepilogoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiepilogoPage, HttpClientTestingModule, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RiepilogoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
