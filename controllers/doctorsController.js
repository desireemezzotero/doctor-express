const connection = require('../data/db')

//Rotta index doctors (visualizza tutti i dottori)
const indexDoctors = (req, res) => {
  res.send('Lista di tutti i dottori');
}

//Rotta show doctor (visualizza un dottore e le sue recensioni)
const showDoctor = (req, res) => {
  const id = req.params.id;
  res.send(`Dettagli del dottore con id: ${id}`);
}

//Rotta store doctor (aggiungi un dottore)
const storeDoctor = (req, res) => {
  res.send('Aggiungi un dottore alla lista dei dottori');
}

//Rotta store review (aggiungi una recensione ad un determinato dottore)
const storeReview = (req, res) => {
  const id = req.params.id
  const { full_name, title, description, vote, date } = req.body

  const sql = 'INSERT INTO doctors_db.reviews (doctor_id, full_name, title, description, vote, date) VALUES(?, ?, ?, ?, ?, ?)'
  connection.query(
    sql,
    [id, full_name, title, description, vote, date],
    (err, results) => {

      if (err) return res.status(500).json({ error: 'Query al database doctors fallita' })
      res.status(201).json({ status: 'success', message: 'Dottore aggiunto con successo' })
    }
  )
}

//Rotta update doctor (modifica un dottore con un determinato id)
const updateDoctor = (req, res) => {
  const id = req.params.id;
  res.send = (`Modifico i dati del dottore con id: ${id}`);
}


module.exports = {
  indexDoctors,
  showDoctor,
  storeDoctor,
  storeReview,
  updateDoctor
}