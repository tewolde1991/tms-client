import { Component, signal, computed, inject } from '@angular/core';
import { Course } from '../../models/course.model';
import { CourseService } from '../../services/course.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { CourseCardComponent } from '../../ui/course-card/course-card';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CourseCardComponent],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.scss',
})
export class StudentDashboardComponent {
  private api = inject(CourseService);
  studentName = signal('Liya Kebede');
  earnedCredits = signal(45);
  // computed() creates a read-only signal that derives its value fromother signals.
  // It recalculates automatically whenever earnedCredits() changes nomanual refresh.
  graduationStatus = computed(() =>
    this.earnedCredits() >= 120 ? 'Eligible for Graduation' : 'In Progress',
  );

  coursesResource = rxResource({
    stream: ()=>this.api.getAll(),
  })
  // A regular method. When called, it updates the earnedCredits signal.
  // The .update() method receives the current value (c) and returns the new value (c + 3).
  registerForClass() {
    this.earnedCredits.update((c) => c + 3);
  }

 
  availableCourses = signal<Course[]>([
    {
      id: 1,
      title: 'Advanced Java Services',
      code: 'CSE-101',
      maxCapacity: 30,
      enrollmentCount: 10,
    },
    {
      id: 2,
      title: 'Angular UI Lab',
      code: 'CSE-210',
      maxCapacity: 25,
      enrollmentCount: 25,
    },
    {
      id: 3,
      title: 'Database Design',
      code: 'CSE-305',
      maxCapacity: 20,
      enrollmentCount: 18,
    },
    {
      id: 4,
      title: 'API Security Workshop',
      code: 'CSE-420',
      maxCapacity: 40,
      enrollmentCount: 15,
    },
  ]);

  selectedCourse = signal<Course | null>(null);

  handleEnroll(course: Course){
    this.selectedCourse.set(course)
    console.log('Enrollment request for:', course.title);
  }
}
