import { operations } from '../_abstract';
import UsersApi from './api';
import { Creators } from './actions';
// ---
export { default as usersReducer } from "./reducers";
export { UserState, User } from './schema';

export default operations(Creators, UsersApi);