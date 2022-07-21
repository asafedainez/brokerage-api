export default interface IApiEditMethods<T> {
  update(id: string, item: T): Promise<T>;
  remove(id: string): Promise<boolean>;
}
