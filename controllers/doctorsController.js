/* rotta index */
const index = (req, res) => {
  res.send('server dei dottori')
}

/* rotta store  */
const store = (req, res) => {
  res.send('Rotta store');
}



module.exports = {
  index,
  show,
  store,
  update
}