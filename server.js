require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

//router import
const doctorRouter = require('./routes/doctorsRouter');

//middlewares
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

app.use(express.static('public'));  //middleware per asset statici
app.use(express.json());  //middleware per parsing del body

//route entry point 
app.get('/', (req, res) => {
  res.send('Server entry point');
})

app.use('/doctors', doctorRouter);
app.use(errorHandler);
app.use(notFound);

app.listen(port, () => {
  console.log(`sono in ascolto alla porta ${port}`);
})