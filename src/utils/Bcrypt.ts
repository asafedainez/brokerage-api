import bcrypt from 'bcrypt';

export default class Bcrypt {
  private salt: number;

  constructor() {
    const { SALT_ROUNDS } = process.env;
    this.salt = Number(SALT_ROUNDS);
  }

  async genHash(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  }
}