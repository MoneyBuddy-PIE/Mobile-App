export interface Answer {
	answer: string;
	correct: boolean;
}

export interface Question {
	question: string;
	answers: Answer[];
}

export interface Course {
	id: string;
	title: string;
	description: string;
	readTime: string;
	subAccountRole: "OWNER" | "PARENT" | "CHILD";
	questions: Question[];
	createdAt: string;
	updatedAt: string;
}

export interface CompleteCourseRequest {
	questionAnswered: number;
}
