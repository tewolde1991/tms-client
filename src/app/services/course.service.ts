import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Course,
  CourseDetail,
  CourseResponse
} from '../models/course.model';

export interface CourseUpsert {
  code: string;
  title: string;
  maxCapacity: number;
}

@Service()
export class CourseService {

  private http = inject(HttpClient);

  private baseUrl = 'http://localhost:5298/api/v2/courses';


  getAll(
    page = 1,
    pageSize = 20
  ): Observable<CourseResponse> {

    return this.http.get<CourseResponse>(
      this.baseUrl,
      {
        params: {
          page,
          pageSize
        }
      }
    );
  }


  getById(
    id: number
  ): Observable<CourseDetail> {

    return this.http.get<CourseDetail>(
      `${this.baseUrl}/${id}`
    );
  }


  create(
    payload: CourseUpsert
  ): Observable<Course> {

    return this.http.post<Course>(
      this.baseUrl,
      payload
    );
  }


  update(
    id: number,
    payload: CourseUpsert
  ): Observable<void> {

    return this.http.put<void>(
      `${this.baseUrl}/${id}`,
      {
        id,
        ...payload
      }
    );
  }
}