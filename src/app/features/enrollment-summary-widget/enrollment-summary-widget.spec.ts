import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollmentSummaryWidget } from './enrollment-summary-widget';

describe('EnrollmentSummaryWidget', () => {
  let component: EnrollmentSummaryWidget;
  let fixture: ComponentFixture<EnrollmentSummaryWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrollmentSummaryWidget],
    }).compileComponents();

    fixture = TestBed.createComponent(EnrollmentSummaryWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
