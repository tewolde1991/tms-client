import { Component, viewChild, effect, inject } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { EnrollmentStore } from '../../store/enrollment.store';
import { Enrollment } from '../../models/enrollment.model';
import { EnrollmentSummaryWidget } from '../enrollment-summary-widget/enrollment-summary-widget';
@Component({
  selector: 'app-enrollment-list',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, EnrollmentSummaryWidget],
  templateUrl: './enrollment-list.html',
  styleUrl: './enrollment-list.scss',
})
export class EnrollmentListComponent {
  store = inject(EnrollmentStore);
  displayedColumns = ['studentName', 'courseName', 'status', 'actions'];
  dataSource = new MatTableDataSource<Enrollment>();
  // viewChild.required() is Angular 22's signal-based replacement for @ViewChild.
  // Unlike the legacy decorator, these are signals — they updatereactively when
  // Angular resolves the template queries. No ngAfterViewInit lifecycle hook needed.
  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);
  constructor() {
    // Effect 1: Push store entities into the Material data source whenever they change
    this.store.loadEnrollments();
    effect(() => {
      this.dataSource.data = this.store.entities();
    });
    // Effect 2: Wire paginator and sort controls once Angular resolves the view queries
    effect(() => {
      this.dataSource.paginator = this.paginator();
      this.dataSource.sort = this.sort();
    });
    this.store.loadEnrollments();
  }
}
