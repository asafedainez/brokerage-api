import IApiEdit from './ApiEdit';
import IApiGet from './ApiGet';

export default interface IApiRestful<T> extends IApiGet<T>, IApiEdit<T> {}
