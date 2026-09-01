import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const roleGuard = (...requiredRoles: string[]): CanActivateFn => {
    return () => {
        const auth = inject(AuthService);
        const router = inject(Router);
        const user = auth.currentUser();
        if (user && requiredRoles.includes(user.role)) {
            return true;
        }
        return router.createUrlTree(["/unauthorized"]);
    };
};