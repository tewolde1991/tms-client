import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnrollmentService } from '../../services/enrollment.service';
import { EnrollStudentCommand } from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-form',
  imports: [ReactiveFormsModule],
  templateUrl: './enrollment-form.html',
  styleUrl: './enrollment-form.scss',
})
export class EnrollmentFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(EnrollmentService);

  submitted = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  /**
   * Form fields.
   * Backend only needs: studentId (number) and courseCode (string).
   * We keep term, notes, backupCourses in the form for UI, but we do NOT
   * send them to the current backend endpoint.
   */
  form = this.fb.nonNullable.group({
    studentId: [
      '',
    ],
    courseCode: ['', [Validators.required]],
    term: ['Fall 2026', [Validators.required]],
    notes: [''],
    backupCourses: this.fb.array<FormControl<string>>([]),
  });

  get backups() {
    return this.form.controls.backupCourses;
  }

  addBackup() {
    this.backups.push(
      this.fb.control('', {
        nonNullable: true,
        validators: Validators.required,
      }),
    );
  }

  removeBackup(index: number) {
    this.backups.removeAt(index);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();

    /**
     * Build the payload that matches the backend command:
     * EnrollStudentCommand(int StudentId, string CourseCode)
     *
     * studentId must be a number, courseCode must be a string.
     */
    const payload: EnrollStudentCommand = {
      // If your studentId is like "STU-0001", you may need to extract the number part.
      // For example, if backend really expects just the numeric id:
      // studentId: Number(raw.studentId.replace('STU-', '')),
      //
      // If backend actually expects the full string as an int, that won't work.
      // Right now your command is: EnrollStudentCommand(int StudentId, string CourseCode)
      // So StudentId must be numeric. If your UI uses "STU-0001", you must decide:
      //   - change backend to string, or
      //   - send only the numeric part.
      //
      // For now, let's assume you will send only the numeric part:
      studentId: Number(raw.studentId.replace('STU-', '')),
      courseCode: raw.courseCode,
    };

    this.api.enroll(payload).subscribe({
      next: (result) => {
        this.submitted.set(true);
        this.isSubmitting.set(false);

        console.log('Enrollment created:', result);

        // Optionally reset the form
        this.form.reset({
          studentId: '',
          courseCode: '',
          term: 'Fall 2026',
          notes: '',
          backupCourses: [],
        });
        // Clear backupCourses array controls if needed:
        this.backups.clear();
      },
      error: (err) => {
        this.isSubmitting.set(false);

        let message = 'Enrollment failed';

        if (err?.error?.detail) {
          message = err.error.detail as string;
        } else if (err?.status === 409) {
          message = 'Course full or already enrolled';
        } else if (err?.status === 404) {
          message = 'Course not found';
        }

        this.error.set(message);
      },
    });
  }
}