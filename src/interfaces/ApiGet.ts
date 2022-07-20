export default interface IApiGet<T> {
  getById(id: string): Promise<T | null>;
  create(item: T): Promise<string | boolean>;
}
