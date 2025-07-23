const formatLog = (message: string, data?: any) => {
	if (data !== undefined) {
		if (typeof data === "object" && data !== null) {
			console.log(message, JSON.stringify(data, null, 2));
		} else {
			console.log(message, data);
		}
	} else {
		console.log(message);
	}
};

export const logger = {
	log: formatLog,
	info: formatLog,
	error: (message: string, data?: any) => {
		console.error(message, data ? JSON.stringify(data, null, 2) : "");
	},
	warn: (message: string, data?: any) => {
		console.warn(message, data ? JSON.stringify(data, null, 2) : "");
	},
};
