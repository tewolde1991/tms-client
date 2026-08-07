import { Component, inject } from '@angular/core';
import { EnrollmentStore } from '../../store/enrollment.store';

@Component({
  selector: 'app-enrollment-summary-widget',
  imports: [],
  templateUrl: './enrollment-summary-widget.html',
  styleUrl: './enrollment-summary-widget.scss',
})
export class EnrollmentSummaryWidget {
  store = inject(EnrollmentStore);
}
