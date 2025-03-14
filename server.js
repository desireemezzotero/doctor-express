const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config();
const cors = require('cors');

app.use(cors({ origin: process.env.ORIGIN }))
//router import
const doctorRouter = require('./routes/doctorsRouter');

//middlewares
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const imagePath = require('./middlewares/imagePath');

app.use(express.static('public'));  //middleware per asset statici
app.use(imagePath); //middleware per accogliere il percorso delle immagini
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