export default interface IJwtPayload {
  sub: string;
  name: string;
  iat?: Date;
  exp?: Date;
}
