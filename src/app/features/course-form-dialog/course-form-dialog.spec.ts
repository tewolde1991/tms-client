import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseFormDialog } from './course-form-dialog';

describe('CourseFormDialog', () => {
  let component: CourseFormDialog;
  let fixture: ComponentFixture<CourseFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(CourseFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
