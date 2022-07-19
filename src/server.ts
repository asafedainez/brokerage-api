import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const { NODE_PORT } = process.env;

app.listen(NODE_PORT, () => {
  console.log(`Server is running on port ${NODE_PORT}`);
});
