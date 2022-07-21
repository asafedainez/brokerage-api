import IApiEditMethods from './ApiEditMethods';
import IApiGetMethods from './ApiGetMethods';

export default interface IApiRestService<T>
  extends IApiGetMethods<T>,
    IApiEditMethods<T> {}
