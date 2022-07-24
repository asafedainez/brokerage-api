import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import app from './app';
import swaggerConfig from './swagger';

dotenv.config();

const { PORT } = process.env;

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
