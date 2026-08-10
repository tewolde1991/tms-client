import { Component, inject } from '@angular/core';
import { GradePayload, GradeService } from '../../services/grade.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, exhaustMap, finalize, of, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-grade-submission',
  imports: [ReactiveFormsModule, MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule],
  templateUrl: './grade-submission.component.html',
  styleUrl: './grade-submission.component.scss',
})
export class GradeSubmissionComponent {

  private api = inject(GradeService);
  private fb = inject(FormBuilder);

  gradeForm = this.fb.group({
    studentId: [
      101,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    courseId: [
      302,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    score: [
      88,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(100)
      ]
    ]
  });

  isSubmitting = false;
  submissionStatus = '';

  private submitClick$ = new Subject<GradePayload>();

  constructor() {
  this.submitClick$
    .pipe(
      exhaustMap(payload => {

        this.isSubmitting = true;
        this.submissionStatus = 'Submitting grade to server...';

        return this.api.postGrade(payload).pipe(

          catchError(err => {
            console.error('Grade submission failed:', err);

            this.submissionStatus =
              `Submission failed: ${
                err.error?.detail ||
                err.error?.message ||
                err.message ||
                'Server error'
              }`;

            return of(null);
          }),

          finalize(() => {
            console.log('HTTP request finished');

            this.isSubmitting = false;
          })
        );
      }),

      takeUntilDestroyed()
    )
    .subscribe(result => {

      if (result) {
        console.log('Grade submission result:', result);

        this.submissionStatus =
          `Grade saved successfully! Record ID: ${result.id}`;
      }
    });
}

  onSubmit(): void {

    if (this.gradeForm.invalid) {
      this.gradeForm.markAllAsTouched();
      return;
    }

    const rawValue = this.gradeForm.getRawValue();

    const payload: GradePayload = {
      studentId: Number(rawValue.studentId),
      courseId: Number(rawValue.courseId),
      score: Number(rawValue.score)
    };

    this.submitClick$.next(payload);
  }
}
