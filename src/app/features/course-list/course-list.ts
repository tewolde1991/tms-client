import { Component, viewChild, effect, inject } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { CourseStore } from '../../store/course.store'; // adjust path
import { Course } from '../../models/course.model';
import { CourseFormDialogComponent } from '../course-form-dialog/course-form-dialog';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './course-list.html',
  styleUrl: './course-list.scss',
})
export class CourseListComponent {
  store = inject(CourseStore);
  private dialog = inject(MatDialog)

  displayedColumns = ['code', 'title', 'enrollmentCount', 'maxCapacity', 'actions'];

  dataSource = new MatTableDataSource<Course>();

 
  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

  constructor() {
    this.store.loadCourses({ page: 1, pageSize: 50 });

    // Effect 1: Keep MatTableDataSource in sync with the store
    effect(() => {
      this.dataSource.data = this.store.courses();
    });

    // Effect 2: Wire paginator + sort once the view children are ready
    effect(() => {
      this.dataSource.paginator = this.paginator();
      this.dataSource.sort = this.sort();
    });
  }
  openCreate() {
    this.dialog.open(CourseFormDialogComponent, {
      width: '420px',
      data: { course: null }, // create mode
    });
  }

  openEdit(course: Course) {
    this.dialog.open(CourseFormDialogComponent, {
      width: '420px',
      data: { course }, // edit mode
    });
  }
}



