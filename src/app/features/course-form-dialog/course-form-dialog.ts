import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CourseStore } from '../../store/course.store';
import { Course } from '../../models/course.model';
import { CourseUpsert } from '../../services/course.service'; // or wherever you put the interface

@Component({
  selector: 'app-course-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './course-form-dialog.html',
  styleUrl: './course-form-dialog.scss',
})
export class CourseFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  public store = inject(CourseStore);
  private dialogRef = inject(MatDialogRef<CourseFormDialogComponent>);
  data = inject<{ course: Course | null }>(MAT_DIALOG_DATA);

  form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(20)]],
    title: ['', [Validators.required, Validators.maxLength(200)]],
    maxCapacity: [30, [Validators.required, Validators.min(1)]],
  });

  isEdit = false;

  ngOnInit() {
    const course = this.data?.course;
    if (course) {
      this.isEdit = true;
      this.form.patchValue({
        code: course.code,
        title: course.title,
        maxCapacity: course.maxCapacity,
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    const payload: CourseUpsert = this.form.getRawValue();

    if (this.isEdit && this.data.course) {
      this.store.updateCourse({ id: this.data.course.id, payload });
    } else {
      this.store.createCourse(payload);
    }

    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}