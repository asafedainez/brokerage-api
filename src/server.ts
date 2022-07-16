import 'express-async-errors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const { NODE_PORT } = process.env;
const server = express();

server.use(express.json());

server.listen(NODE_PORT, () => {
  console.log(`Server is running on port ${NODE_PORT}`);
});
