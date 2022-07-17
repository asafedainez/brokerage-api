export default interface IJWTPayload {
  sub: string;
  name: string;
  iat?: Date;
  exp?: Date;
}
