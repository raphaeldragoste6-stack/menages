import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Menage } from './menage';

describe('Menage', () => {
  let component: Menage;
  let fixture: ComponentFixture<Menage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Menage],
    }).compileComponents();

    fixture = TestBed.createComponent(Menage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
