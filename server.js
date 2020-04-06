const dotenv = require('dotenv');
const port = process.env.PORT || 3000;

const app = require('./app');

dotenv.config({path:'./config.env'});

app.listen(port, () => {
  console.log(`App is running in port${port}`);
});