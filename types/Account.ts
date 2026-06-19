export type SubAccountRole = 'OWNER' | 'PARENT' | 'CHILD';

export interface Authority {
    authority: string;
}

export interface Setting {
    id: string;
    subAccountId: string;
    preValidate: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface SubAccount {
    id: string;
    accountId: string;
    name: string;
    role: SubAccountRole;
    money: number;
    income: number;
    coin: number;
    iconStyle: string | null;
    iconName: string | null;
    setting: Setting | null;
    active: boolean;
    createdAt: string;
    updatedAt: string | null;
    lastConnexion: string | null;
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
