import IApiEdit from './ApiEdit';
import IApiGet from './ApiGet';

export default interface IApiRestfulService<T>
  extends IApiGet<T>,
    IApiEdit<T> {}
