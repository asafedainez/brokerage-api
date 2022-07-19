export default interface IAccountTransaction {
  id: string;
  idUser: string;
  operation: string;
  value: number;
  createdAt: Date;
}
