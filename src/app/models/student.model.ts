
export interface Student {
id: number;
registrationNumber: string;
name: string;
gpa: number;
isActive: boolean;
}
/** Envelope for `GET /api/students` — TMS API contract list shape (`Pag
edResponse<T>`). */
export interface PagedResponse<T> {
items: T[];
totalCount: number;
page: number;
pageSize: number;
totalPages: number;
hasPrevious: boolean;
hasNext: boolean;
}

export interface StudentLink {
    href: string;
    rel: string;
    method: string;
}
export interface UpdateStudentRequest{
    name: string;
    gpa: number;
    isActive: boolean,
    version: number;
}

export interface StudentDetail extends Student {
    enrollmentCount: number;
    links: readonly StudentLink[];
}

export interface CreateStudentRequest{
    registrationNumber: string;
    name: string;
}