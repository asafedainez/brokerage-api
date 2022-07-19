export default interface IApiEdit<T> {
  update(id: string, item: T): Promise<T>;
  remove(id: string): Promise<boolean>;
}
