export default interface IJWTPayload {
  sub: number;
  name: string;
  iat?: Date;
  exp?: Date;
}
