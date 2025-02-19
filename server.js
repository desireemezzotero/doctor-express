const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const errorHandler = require ('./middleware/errorHandler')
const notFound = require ('./middleware/notFound')

app.use(express.static('public'));

app.use(express.json());

app.get('/', (req,res) => {
  res.send('sono la prima rotta')
})

app.use(errorHandler)
app.use(notFound)

app.listen(port, ()=> {
  console.log(`sono in ascolto alla porta ${port}`)
})