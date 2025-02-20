const connection = require('../data/db')


//Rotta index doctors (visualizza tutti i dottori)
const indexDoctors = (req, res) => {
  const sql = `SELECT doctors.* , reviews.*
               FROM doctors 
               LEFT JOIN reviews ON reviews.doctor_id = doctors.id`

  connection.query(sql, (err,results) => {

    if(err) return res.status(500).json({err:'query al db fallita'})

    const doctors = []
  
    results.forEach(res => {

      let doctor = doctors.find(d => d.id === res.doctor_id);

      if (!doctor) {
        doctor = {
          id: res.doctor_id,
          name: res.name,
          surname: res.surname,
          telephone: res.telephone,
          email: res.email,
          reviews: []
        };
        doctors.push(doctor); 
      }

      if (res.full_name) {
        doctor.reviews.push({
          full_name: res.full_name,
          vote: res.vote,
          description: res.description,
          date: res.date
        });
      }
    })

    res.json(doctors);

     console.log(doctors)
    })
  }


//Rotta show doctor (visualizza un dottore e le sue recensioni)
const showDoctor = (req, res) => {
  const id = req.params.id;

  const sql = ` SELECT D.*, ROUND(AVG(R.vote),1) AS average_vote, D.image
  FROM doctors D
  LEFT JOIN reviews R ON D.id = R.doctor_id
  WHERE D.id = ?
  `
  const sqlReviews = `SELECT *
  FROM reviews R
  WHERE R.doctor_id = ?
  `

  //Query per il singolo dottore
  connection.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Query error on database (doctor)' });
    if (results.length === 0 || results[0].id === null) return res.status(404).json({ error: 'Doctor not found' });
    const doctor = {
      ...results[0],
      image_url: results[0].image ? `${req.protocol}://${req.get('host')}/img/doctor_img/${results[0].image}` : null
    }

    //Query per le recensioni
    connection.query(sqlReviews, [id], (err, resultsReviews) => {
      if (err) return res.status(500).json({ error: 'Query error on database (review)' });

      res.json({
        ...doctor,
        reviews: resultsReviews
      })
    })

  })
}

//Rotta store doctor (aggiungi un dottore)
const storeDoctor = (req, res) => {
  const { name, surname, telephone, email, specialities } = req.body;
  const imageName = 'ciao'; //req.file.filename;

  const sql = 'INSERT INTO doctors (name, surname, telephone, email, image) VALUES (?, ?, ?, ?, ?)';
  const sqlGetLastId = 'SELECT LAST_INSERT_ID()';
  const sqlInsBridgeTable = 'INSERT INTO doctor_speciality (doctor_id, speciality_id) VALUES (?, ?)';

  connection.query(sql, [name, surname, telephone, email, imageName], (err, results) => {
    if (err) return res.status(500).json({ error: 'Errore durante l\'aggiunta di un dottore' });
    res.status(201).json({ status: 'Added', message: 'Dottore aggiunto con successo' });

    connection.query(sqlGetLastId, (err, results) => {
      const result = results;
      const lastInsertId = result[0]['LAST_INSERT_ID()'];

      if (specialities && specialities.length > 0) {
        const specialityValues = specialities.map(specialityId => [lastInsertId, specialityId]);

        specialityValues.map(element => {
          connection.query(sqlInsBridgeTable, [element[0], element[1]], (err, results) => {
            console.log('Inserimento dati con successo')
          })
        })
      }
    })
  })
}

//Rotta store review (aggiungi una recensione ad un determinato dottore)
const storeReview = (req, res) => {
  const id = req.params.id
  const { full_name, title, description, vote, date } = req.body
  
  if(!full_name || !title || !description || !vote){
    res.status(400).json({error: 'Tutti i dati sono obbligatori'})}

  const sql = 'INSERT INTO doctors_db.reviews (doctor_id, full_name, title, description, vote, date) VALUES(?, ?, ?, ?, ?, ?)'
  connection.query(
    sql,
    [id, full_name, title, description, vote, date],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Query al database doctors fallita' })
      res.status(201).json({ status: 'success', message: 'Recensione al dottore aggiunta con successo' })
    }
  )
}

//Rotta update doctor (modifica un dottore con un determinato id)
const updateDoctor = (req, res) => {
  const id = req.params.id;
  res.send = (`Modifico i dati del dottore con id: ${id}`);
}

//ciao
module.exports = {
  indexDoctors,
  showDoctor,
  storeDoctor,
  storeReview,
  updateDoctor
}