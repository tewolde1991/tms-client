import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UpdateStudentRequest } from '../../models/student.model';

@Component({
  selector: 'app-student-form',
  imports: [ReactiveFormsModule],
  templateUrl: './student-form.html',
  styleUrl: './student-form.scss',
})
export class StudentFormComponent {
  private fb = inject(FormBuilder);

  // optional pass existing student
  initialValue = input<UpdateStudentRequest | null>(null);
  saved = output<UpdateStudentRequest>();

  // simple ui state
  submitted = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    gpa: [0, [Validators.required, Validators.min(0), Validators.max(4)]],
    isActive: [true],
    version: [0],
  });

  
  patchForm(data: UpdateStudentRequest) {
    this.form.patchValue(data);
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saved.emit(value);
  }

  get name() {
    return this.form.controls.name;
  }
  get gpa() {
    return this.form.controls.gpa;
  }
  get isActive() {
    return this.form.controls.isActive;
  }
}
