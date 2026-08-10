import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { setAllEntities, updateEntity, withEntities } from "@ngrx/signals/entities";
import { computed, inject } from "@angular/core";
import { Enrollment } from "../models/enrollment.model";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { catchError, concatMap, EMPTY, pipe, switchMap, tap } from "rxjs";
import { EnrollmentService } from "../services/enrollment.service";
import { LiveSyncService } from "../services/live-sync";


export const EnrollmentStore = signalStore({
    providedIn: 'root'
},
withState({
    isLoading: false, 
    error: null as string | null}),
withEntities<Enrollment>(),
withComputed((store) => ({
    pendingCount: computed(
        () =>store.entities().filter(e =>e.status === 'Pending').length
    ),
})),
withMethods(
    (
        store,
        api = inject(EnrollmentService),
        sync = inject(LiveSyncService)
    ) => ({
        listenForLiveUpdates: rxMethod<void>(
            pipe(
                tap(() => {
                    sync.connect();
                }),

                // listen to signalr event
                switchMap(() => sync.events$),
                tap(event => {
                    patchState(
                        store,
                        updateEntity({
                            id:Number(event.id),

                            changes: {
                                status: event.status
                            }
                        })
                    )
                })
            )
        )
    })
),
withComputed((store)=>({
    rejectCount: computed(
  () => store.entities().filter(e => e.status === 'Rejected').length
)
})),
withMethods((store, api = inject(EnrollmentService)) => ({
loadEnrollments: rxMethod<void>(
    pipe(
        tap(() => patchState(store, {isLoading: true, error: null})),
        concatMap(()=> api.getAll().pipe(
            tap(rows => patchState(store,setAllEntities(rows), {isLoading: false})),
            catchError(err => {
                patchState(store, {isLoading:false, error: err.message});
                return EMPTY;
            })
        ))
    )
),

approveEnrollment: rxMethod<string>(
    pipe(
        tap(id => {
            patchState(store, updateEntity({id, changes: {status:'Approved'}}));
        }),
        concatMap(id=>api.approve(id).pipe(
            catchError(err=>{
                patchState(store,updateEntity({id,changes:{status:'Pending'}}));
                patchState(store, {error: 'Server rejected the approval. Check enrollment constraints'});
                return EMPTY;
            })
        ))
    )
),
}))

);