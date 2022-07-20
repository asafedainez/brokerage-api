export default interface IOperation {
  id?: string;
  idUser: string;
  idAsset: string;
  createdAt?: Date;
  quantity: number;
  purchasePrice: number;
  type: string;
}
