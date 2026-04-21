/**
 * useInstitutionTerms
 * Returns the correct UI terminology based on the institution type
 * of the currently selected school.
 *
 * Institution Types:
 *   K12_SCHOOL    → Classes & Sections, Subjects
 *   TRAINING_CENTER → Courses & Batches, Modules
 *   INSTITUTE       → Courses & Batches, Modules
 *   COLLEGE         → Courses & Sections, Subjects
 */

import { authStore } from '../stores/authStore';

export type InstitutionType = 'K12_SCHOOL' | 'TRAINING_CENTER' | 'INSTITUTE' | 'COLLEGE';

export interface InstitutionTerms {
    institutionType: InstitutionType;
    /** 'School', 'Computer Center', 'Institute', 'College' */
    institutionLabel: string;
    /** true if institution uses courses as its primary grouping */
    usesCourses: boolean;
    /** true if institution can ALSO offer courses alongside classes (schools in future) */
    canHaveCourses: boolean;
    /** 'Class' | 'Course' */
    classLabel: string;
    /** 'Classes' | 'Courses' */
    classesLabel: string;
    /** 'Add Class' | 'Add Course' */
    addClassLabel: string;
    /** 'Section' | 'Batch' */
    sectionLabel: string;
    /** 'Sections' | 'Batches' */
    sectionsLabel: string;
    /** 'Subject' | 'Module' */
    subjectLabel: string;
    /** 'Subjects' | 'Modules' */
    subjectsLabel: string;
    /** 'Student' | 'Trainee' */
    studentLabel: string;
    /** 'Students' | 'Trainees' */
    studentsLabel: string;
    /** Default class_type to use when creating a new class: 'CLASS' or 'COURSE' */
    defaultClassType: 'CLASS' | 'COURSE';
}

const TERMS_MAP: Record<InstitutionType, InstitutionTerms> = {
    K12_SCHOOL: {
        institutionType: 'K12_SCHOOL',
        institutionLabel: 'School',
        usesCourses: false,
        canHaveCourses: true,  // schools can optionally introduce courses
        classLabel: 'Class',
        classesLabel: 'Classes',
        addClassLabel: 'Add Class',
        sectionLabel: 'Section',
        sectionsLabel: 'Sections',
        subjectLabel: 'Subject',
        subjectsLabel: 'Subjects',
        studentLabel: 'Student',
        studentsLabel: 'Students',
        defaultClassType: 'CLASS',
    },
    TRAINING_CENTER: {
        institutionType: 'TRAINING_CENTER',
        institutionLabel: 'Computer Center',
        usesCourses: true,
        canHaveCourses: true,
        classLabel: 'Course',
        classesLabel: 'Courses',
        addClassLabel: 'Add Course',
        sectionLabel: 'Batch',
        sectionsLabel: 'Batches',
        subjectLabel: 'Module',
        subjectsLabel: 'Modules',
        studentLabel: 'Trainee',
        studentsLabel: 'Trainees',
        defaultClassType: 'COURSE',
    },
    INSTITUTE: {
        institutionType: 'INSTITUTE',
        institutionLabel: 'Institute',
        usesCourses: true,
        canHaveCourses: true,
        classLabel: 'Course',
        classesLabel: 'Courses',
        addClassLabel: 'Add Course',
        sectionLabel: 'Batch',
        sectionsLabel: 'Batches',
        subjectLabel: 'Module',
        subjectsLabel: 'Modules',
        studentLabel: 'Trainee',
        studentsLabel: 'Trainees',
        defaultClassType: 'COURSE',
    },
    COLLEGE: {
        institutionType: 'COLLEGE',
        institutionLabel: 'College',
        usesCourses: true,
        canHaveCourses: true,
        classLabel: 'Course',
        classesLabel: 'Courses',
        addClassLabel: 'Add Course',
        sectionLabel: 'Section',
        sectionsLabel: 'Sections',
        subjectLabel: 'Subject',
        subjectsLabel: 'Subjects',
        studentLabel: 'Student',
        studentsLabel: 'Students',
        defaultClassType: 'COURSE',
    },
};

export function useInstitutionTerms(): InstitutionTerms {
    const { user } = authStore();
    const currentSchoolId = typeof user?.school === 'string' ? user?.school : user?.school?.id;
    const currentSchool = user?.allowed_schools?.find((s: any) => s.id === currentSchoolId);
    const type = (currentSchool?.institution_type as InstitutionType) || 'K12_SCHOOL';
    return TERMS_MAP[type] ?? TERMS_MAP['K12_SCHOOL'];
}

/** Use this outside of React components (e.g. service calls) */
export function getTermsForType(type: InstitutionType): InstitutionTerms {
    return TERMS_MAP[type] ?? TERMS_MAP['K12_SCHOOL'];
}
