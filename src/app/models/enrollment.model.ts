export interface Enrollment{
    id: string;
    studentId: number;
    courseCode?: string;
    term?: string;
    status: string;
}

export interface EnrollStudentCommand{
    studentId: number;
    courseCode : string;
}
export interface EnrollmentCreated {
  enrollmentId: number;
  studentId: number;
  courseCode: string;
}
