import { Component, inject, OnInit } from '@angular/core';
import { EnrollmentStore } from '../../store/enrollment.store';
import { AnalyticsChartComponent } from '../../ui/analytics-chart/analytics-chart';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-instructor-dashboard',
  imports: [AnalyticsChartComponent, RouterLink],
  templateUrl: './instructor-dashboard.html',
  styleUrl: './instructor-dashboard.scss',
})
export class InstructorDashboardComponent implements OnInit{
   store = inject(EnrollmentStore);
   ngOnInit() {
     this.store.loadEnrollments();
     this.store.listenForLiveUpdates();
   }
}
