export default interface IApiGet<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T>;
  create(item: T): Promise<T>;
}
