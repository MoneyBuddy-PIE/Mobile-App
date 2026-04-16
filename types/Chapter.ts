export interface Quiz {
	id: string
	sectionId: string
	question: string;
	response: string
	options: string[];
	correctAnswerIndex: number;
	minimumScoreToPass: number;
}

export interface Section {
	id: string
	title: string;
	markdownContent: string;
	completed: boolean
	quiz?: Quiz[];
}

export interface Resource {
	title: string;
	url: string;
	type: "PDF";
}

export interface Course {
	id: string
	title: string;
	description: string;
	order: number;
	readTime: number;
	imageUrl: string;
	sections: Section[];
	ressource: Resource[];
	locked: boolean;
	completed: boolean;
}

export enum ChapterCategory {
	ALL = 'ALL',
	SIX_TO_TEN = 'SIX_TO_TEN',
	TEN_TO_FOURTEEN = 'TEN_TO_FOURTEEN',
	BASICS = 'BASICS',
}

export interface Chapter {
	id: string;
	title: string;
	description: string;
	level: number;
	order: number;
	subAccountRole: "OWNER" | "PARENT" | "CHILD";
	courses: Course[];
	imageUrl: string;
	creatorId: string;
	createdAt: string;
	updatedAt: string;
}

export interface ChapterResponse {
	totalPages: number;
	totalElements: number;
	size: number;
	content: Chapter[];
	number: number;
	sort: SortInfo[];
	pageable: PageableInfo;
	numberOfElements: number;
	first: boolean;
	last: boolean;
	empty: boolean;
}

export interface SortInfo {
	direction: string;
	nullHandling: string;
	ascending: boolean;
	property: string;
	ignoreCase: boolean;
}

export interface PageableInfo {
	offset: number;
	sort: SortInfo[];
	paged: boolean;
	pageNumber: number;
	pageSize: number;
	unpaged: boolean;
}
