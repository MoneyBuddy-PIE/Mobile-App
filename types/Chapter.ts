export interface Quiz {
	question: string;
	options: string[];
	correctAnswerIndex: number;
	minimumScoreToPass: number;
}

export interface Section {
	title: string;
	content: string;
	quiz?: Quiz;
}

export interface Resource {
	title: string;
	url: string;
	type: "PDF";
}

export interface Course {
	title: string;
	description: string;
	order: number;
	readTime: number;
	sections: Section[];
	resources: Resource[];
	locked: boolean;
}

export interface Chapter {
	id: string;
	title: string;
	description: string;
	level: number;
	order: number;
	subAccountRole: "OWNER" | "PARENT" | "CHILD";
	courses: Course[];
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
