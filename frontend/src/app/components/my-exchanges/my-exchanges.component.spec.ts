import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyExchangesComponent } from './my-exchanges.component';

describe('MyExchangesComponent', () => {
  let component: MyExchangesComponent;
  let fixture: ComponentFixture<MyExchangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyExchangesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyExchangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
