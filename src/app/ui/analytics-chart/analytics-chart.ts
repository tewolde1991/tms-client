import { Component, computed, input } from '@angular/core';
import { Enrollment } from '../../models/enrollment.model';

@Component({
  selector: 'app-analytics-chart',
  standalone: true,
  templateUrl: './analytics-chart.html',
  styleUrl: './analytics-chart.scss'
})
export class AnalyticsChartComponent {
  readonly data = input.required<Enrollment[]>();

  readonly approvedCount = computed(() =>
    this.data().filter(e => e.status === 'Approved').length
  );

  readonly pendingCount = computed(() =>
    this.data().filter(e => e.status === 'Pending').length
  );

  readonly rejectedCount = computed(() =>
    this.data().filter(e => e.status === 'Rejected').length
  );

  readonly approvedHeight = computed(() =>
    Math.max(20, this.approvedCount() * 3)
  );

  readonly pendingHeight = computed(() =>
    Math.max(20, this.pendingCount() * 3)
  );

  readonly rejectedHeight = computed(() =>
    Math.max(20, this.rejectedCount() * 3)
  );
}