import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookiesInfoComponent } from './cookies-info.component';

describe('CookiesInfoComponent', () => {
  let component: CookiesInfoComponent;
  let fixture: ComponentFixture<CookiesInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookiesInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CookiesInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
