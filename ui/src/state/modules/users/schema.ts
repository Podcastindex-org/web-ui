import { BaseState } from '../_abstract/schema';

export interface User {
    id?: number,
    birthMonth?: number,
    birthDay?: number,
    birthYear?: number,
    firstName?: string,
    lastName?: string,
    email: string,
    hasPreexistingResults?: boolean,
    token?: string,
    facebookId?: string,
    avatar?: string,
    slug?: string,
    referralUri?: string,
    activeProfile?: boolean,
}

export interface UserState extends BaseState {
    data: User[]
}