import { Component, effect, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-course-detail',
  imports: [RouterLink],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.scss',
})
export class CourseDetail {
  id = input.required<string>();

  constructor(){
    effect(() => {
      console.log(`Loading course detail for Id: ${this.id()}`)
    })
  }
}
