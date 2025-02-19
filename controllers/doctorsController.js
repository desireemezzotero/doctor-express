//rotta index
const index = (req, res) => {
  res.send('server dei dottori');
}

//controller show
const show = (req, res) => {
  const id = req.params.id;
  res.send(`Dettagli del dottore con id ${id}`);
}

//rotta store
const store = (req, res) => {
  res.send('Rotta store');
}

//rotta update
const update = (req, res) => {
  const id = req.params.id;
  res.send = (`Rotta update con id ${id}`);
}


module.exports = {
  index,
  show,
  store,
  update
}
