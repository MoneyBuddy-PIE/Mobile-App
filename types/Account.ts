export interface Authority {
	authority: string;
}

export interface SubAccount {
	accountId: string;
	active: boolean;
	createdAt: string;
	id: string;
	lastConnexion: string | null;
	name: string;
	role: string;
	updatedAt: string | null;
}

export interface Account {
	id: string;
	email: string;
	username: string;
	accountNonExpired: boolean;
	accountNonLocked: boolean;
	authorities: Authority[];
	createdAt: string;
	credentialsNonExpired: boolean;
	enabled: boolean;
	lastConnexion: string;
	planType: string;
	role: string;
	subAccounts: SubAccount[];
	subscriptionStatus: boolean;
	updatedAt: string | null;
}