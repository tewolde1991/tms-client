export interface Enrollment{
    id: string;
    studentId: string;
    studentName: string;
    courseId: string;
    courseName: string;
    status: 'Pending'| 'Approved' | 'Rejected';
    enrolledAt: string;
}
