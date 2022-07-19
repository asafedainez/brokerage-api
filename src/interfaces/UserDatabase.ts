import IUser from './User';

export default interface IUserDatabase extends IUser {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  password: string;
}
