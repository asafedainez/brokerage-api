import dotenv from 'dotenv';
import express from 'express';
import 'express-async-errors';
import errorMiddleware from './middleware/error.middleware';
import routes from './routes';

dotenv.config();

const { NODE_PORT } = process.env;
const server = express();

server.use(express.json());

server.use(routes)

server.use(errorMiddleware);

server.listen(NODE_PORT, () => {
  console.log(`Server is running on port ${NODE_PORT}`);
});
