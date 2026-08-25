import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http"
import { inject } from "@angular/core"
import { Router } from "@angular/router"
import { catchError, throwError } from "rxjs";


export const errorInterceptor: HttpInterceptorFn= (req,next)=>{
    const router = inject(Router);
    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {
            // extract c# rec 7807 problemdetails datil propery
            const detailMessage = err.error?.detail ?? 'A system error occured. Plase try again.';
            if(err.status === 401){
                // redirect expired or unauthenticated session back to login
                router.navigate(['/login']);

            } else{
                console.error('API Error Response:',detailMessage);
            }
            return throwError(() => err);
        })
    );
};