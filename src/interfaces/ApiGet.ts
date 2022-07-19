export default interface IApiGet<T> {
  getAll(): Promise<T[] | void[]>;
  getById(id: string): Promise<T | null>;
  create(item: T): Promise<string | boolean>;
}
