import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of, concatMap } from 'rxjs';
import { CourseService, CourseUpsert } from '../services/course.service'; // your service
import { Course, CourseDetail, CourseResponse } from '../models/course.model';

export const CourseStore = signalStore(
  { providedIn: 'root' },

  withState({
    // list
    courses: [] as Course[],
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,

    // detail (optional – can live in the same store or a separate detail store)
    selectedCourse: null as CourseDetail | null,

    isLoading: false,
    isLoadingDetail: false,
    error: null as string | null,
  }),

  withComputed((store) => ({
    // example derived signals
    fullCourses: computed(() =>
      store.courses().filter(c => c.enrollmentCount >= c.maxCapacity)
    ),
    availableSeats: computed(() =>
      store.courses().map(c => ({
        id: c.id,
        remaining: Math.max(0, c.maxCapacity - c.enrollmentCount),
      }))
    ),
  })),

  withMethods((store, api = inject(CourseService)) => ({
    loadCourses: rxMethod<{ page?: number; pageSize?: number }>(
      pipe(
        tap(({ page = 1, pageSize = 10 }) =>
          patchState(store, { isLoading: true, error: null, page, pageSize })
        ),
        switchMap(({ page = 1, pageSize = 10 }) =>
          api.getAll(page, pageSize).pipe(
            tap((res: CourseResponse) =>
              patchState(store, {
                courses: res.data,
                totalCount: res.meta.totalCount,
                page: res.meta.page,
                pageSize: res.meta.pageSize,
                totalPages: res.meta.totalPages,
                hasPrevious: res.meta.hasPrevious,
                hasNext: res.meta.hasNext,
                isLoading: false,
              })
            ),
            catchError(err => {
              patchState(store, {
                isLoading: false,
                error: err.message ?? 'Failed to load courses',
              });
              return of(null);
            })
          )
        )
      )
    ),

    loadCourseDetail: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoadingDetail: true, error: null })),
        switchMap(id =>
          api.getById(id).pipe(
            tap((detail: CourseDetail) =>
              patchState(store, {
                selectedCourse: detail,
                isLoadingDetail: false,
              })
            ),
            catchError(err => {
              patchState(store, {
                isLoadingDetail: false,
                error: err.message ?? 'Failed to load course',
                selectedCourse: null,
              });
              return of(null);
            })
          )
        )
      )
    ),

    createCourse: rxMethod<CourseUpsert>(
        pipe(
            tap(()=> patchState(store, {isLoading: true, error: null})),
            switchMap(payload=>
                api.create(payload).pipe(
                    tap((created: Course) => {
                        // Add the new course to the current page
                        patchState(store, {
                            courses: [created, ...store.courses()],
                            totalCount: store.totalCount() +1,
                            isLoading: false,
                        })
                    }),
                    catchError(err => {
                        patchState(store, {
                            isLoading: false,
                            error:err?.message ?? 'Failed to create course',
                        })
                        return of(null)
                    })
                )
            )
        )
    ),
    updateCourse: rxMethod<{ id: number; payload: CourseUpsert }>(
    pipe(
      tap(() => patchState(store, { isLoading: true, error: null })),
      switchMap(({ id, payload }) =>
        api.update(id, payload).pipe(
          tap(() => {
            // Replace in the list
            const courses = store.courses().map(c =>
              c.id === id ? { ...c, ...payload } : c
            );

            // Also update detail if it is currently open
            const selected = store.selectedCourse();
            const selectedCourse =
              selected?.id === id
                ? { ...selected, ...payload }
                : selected;

            patchState(store, {
              courses,
              selectedCourse,
              isLoading: false,
            });
          }),
          catchError(err => {
            patchState(store, {
              isLoading: false,
              error: err?.message ?? 'Failed to update course',
            });
            return of(null);
          })
        )
      )
    )
  ),

    // later: when an enrollment is approved you can update enrollmentCount
    // optimistically so the list stays in sync without reloading
  }))
);