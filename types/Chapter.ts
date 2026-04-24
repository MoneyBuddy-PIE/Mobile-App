import { SubAccountRole } from './Account';

export type RessourceType = 'PDF' | 'ARTICLE' | 'VIDEO' | 'WEBSITE' | 'DOCUMENT';

export interface Quiz {
    id: string;
    sectionId: string;
    courseId: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

export interface Section {
    id: string;
    courseId: string;
    chapterId: string;
    title: string;
    markdownContent: string;
    minimumScoreToPass: number;
    createdAt: string;
    updatedAt: string;
    quiz?: Quiz[];
}

export interface SectionWithProgress extends Section {
    completed: boolean;
}

export interface Ressource {
    id: string;
    courseId: string;
    title: string;
    url: string;
    type: RessourceType;
    createdAt: string;
    updatedAt: string;
}

/** @deprecated Use Ressource instead */
export type Resource = Ressource;

export interface Course {
    id: string;
    chapterId: string;
    accountId: string;
    image_url: string | null;
    title: string;
    description?: string;
    readTime: number;
    order: number;
    coinReward: number;
    locked: boolean;
    viewed: number;
    completed: number;
    createdAt: string;
    updatedAt: string;
    ressource?: Ressource[];
    sections?: Section[];
}

export interface CourseWithProgress {
    id: string;
    chapterId: string;
    title: string;
    order: number;
    coinReward: number;
    imageUrl: string | null;
    readTime: number;
    locked: boolean;
    completed: boolean;
    completedCoursesCount: number;
    totalCoursesCount: number;
    progressPercentage: number;
    createdAt: string;
    updatedAt: string;
    ressources?: Ressource[];
    sections?: SectionWithProgress[];
}

export interface CourseWithoutSectionsWithProgress {
    id: string;
    chapterId: string;
    title: string;
    order: number;
    coinReward: number;
    imageUrl: string | null;
    readTime: number;
    locked: boolean;
    completed: boolean;
    completedCoursesCount: number;
    totalCoursesCount: number;
    progressPercentage: number;
    createdAt: string;
    updatedAt: string;
}

export interface Chapter {
    id: string;
    accountId: string;
    title: string;
    description: string;
    level: number;
    order: number;
    coinReward: number;
    image_url: string | null;
    locked: boolean;
    viewed: number;
    completed: number;
    subAccountRole: SubAccountRole;
    createdAt: string;
    updatedAt: string;
    courses: Course[];
}

export interface ChapterWithoutCoursesWithProgress {
    id: string;
    title: string;
    description: string;
    level: number;
    order: number;
    coinReward: number;
    imageUrl: string | null;
    locked: boolean;
    completed: boolean;
    completedCoursesCount: number;
    totalCoursesCount: number;
    progressPercentage: number;
    createdAt: string;
    updatedAt: string;
}

export interface SortObject {
    direction: string;
    nullHandling: string;
    ascending: boolean;
    property: string;
    ignoreCase: boolean;
}

/** @deprecated Use SortObject instead */
export type SortInfo = SortObject;

export interface PageableObject {
    offset: number;
    sort: SortObject[];
    paged: boolean;
    pageNumber: number;
    pageSize: number;
    unpaged: boolean;
}

/** @deprecated Use PageableObject instead */
export type PageableInfo = PageableObject;

export interface ChapterResponse {
    totalPages: number;
    totalElements: number;
    size: number;
    content: Chapter[];
    number: number;
    sort: SortObject[];
    pageable: PageableObject;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface CourseResponse {
    totalPages: number;
    totalElements: number;
    size: number;
    content: Course[];
    number: number;
    sort: SortObject[];
    pageable: PageableObject;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface PageChapterWithoutCoursesWithProgress {
    totalElements: number;
    totalPages: number;
    size: number;
    content: ChapterWithoutCoursesWithProgress[];
    number: number;
    sort: SortObject[];
    numberOfElements: number;
    pageable: PageableObject;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface PageCourseWithoutSectionsWithProgress {
    totalElements: number;
    totalPages: number;
    size: number;
    content: CourseWithoutSectionsWithProgress[];
    number: number;
    sort: SortObject[];
    numberOfElements: number;
    pageable: PageableObject;
    first: boolean;
    last: boolean;
    empty: boolean;
}
