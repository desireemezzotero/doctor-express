const connection = require('../data/db');


//Rotta index doctors (visualizza tutti i dottori)
const indexDoctors = (req, res) => {

  const sql = `
    SELECT doctors.*,
    GROUP_CONCAT(CONCAT(specialities.name) ORDER BY specialities.name ASC SEPARATOR ', ') AS name_speciality
    FROM doctors
    JOIN doctor_speciality ON doctors.id = doctor_speciality.doctor_id
    JOIN specialities ON doctor_speciality.speciality_id = specialities.id
    GROUP BY doctors.id
    ORDER BY doctors.id;
    `;

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ err: 'query al db fallita' })
    res.json(results)
  })

}

//Rotta show doctor (visualizza un dottore le sue recensioni, le sue specializzazioni e le sedi in cui opera)
const showDoctor = (req, res) => {
  const id = req.params.id;

  const sql = ` 
    SELECT 
    d.id AS doctorId, 
    d.name AS doctorName, 
    d.surname AS doctorSurname, 
    d.telephone AS doctorTelephone, 
    d.email AS doctorMail, 
    d.image AS image,
    ROUND(AVG(R.vote),1) AS average_vote,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'specialityName', s.name, 
        'specialityDescription', s.description
      )
    ) AS specializations,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', r.id,
        'vote', r.vote,
        'title', r.title,
        'description', r.description,
        'date', r.date
      )
    ) AS reviews,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'addressId', a.id,
        'name_address', a.name_address,
        'number', a.number,
        'city', a.city,
        'cap', a.cap,
        'province_of_city', a.province_of_city
      )
    ) AS addresses
    FROM doctors d
    LEFT JOIN doctor_speciality ds ON d.id = ds.doctor_id
    LEFT JOIN specialities s ON ds.speciality_id = s.id
    LEFT JOIN reviews r ON d.id = r.doctor_id
    LEFT JOIN doctor_address da ON d.id = da.doctor_id
    LEFT JOIN addresses a ON da.address_id = a.id
    WHERE d.id = ?
    GROUP BY d.id, d.name, d.surname, d.telephone, d.email, d.image;
  `;

  connection.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Query error on database' });
    if (results.length === 0 || results[0].doctorId === null) return res.status(404).json({ error: 'Doctor not found' });

    // Eliminazione duplicati nelle specializzazioni
    let specialitiesArray = [];
    results[0].specializations.forEach(specialization => {
      if (!specialitiesArray.some(item => item.specialityName === specialization.specialityName)) {
        specialitiesArray.push(specialization);
      }
    });

    // Eliminazione duplicati nelle recensioni
    let reviewsArray = [];
    results[0].reviews.forEach(review => {
      if (!reviewsArray.some(item => item.id === review.id)) {
        reviewsArray.push(review)
      }
    });

    // Eliminazione duplicati negli indirizzi
    let addressesArray = [];
    results[0].addresses.forEach(address => {
      if (!addressesArray.some(item => item.addressId === address.addressId)) {
        addressesArray.push(address)
      }
    });

    const doctor = {
      ...results[0],
      addresses: addressesArray,
      specializations: specialitiesArray,
      reviews: reviewsArray,
      image_url: results[0].image ? `${req.protocol}://${req.get('host')}/img/doctor_img/${results[0].image}` : null
    };

    res.json(doctor);
  });
};

//Rotta store doctor (aggiungi un dottore e i relativi dati)
const storeDoctor = (req, res) => {
  const { name, surname, telephone, email, specialities, addresses } = req.body;
  const imageName = 'ciao'; //req.file.filename;


  const sql = 'INSERT INTO doctors (name, surname, telephone, email, image) VALUES (?, ?, ?, ?, ?)';
  const sqlInsBridgeTable = 'INSERT INTO doctor_speciality (doctor_id, speciality_id) VALUES (?, ?)';
  const sqlAddress = 'INSERT INTO addresses (name_address, number, city, cap, province_of_city) VALUES (?, ?, ?, ?, ?)';
  const sqlInsBridgeTableAddress = 'INSERT INTO doctor_address (doctor_id, address_id) VALUES (?, ?)';

  connection.query(sql, [name, surname, telephone, email, imageName], (err, results) => {
    if (err) return res.status(500).json({ error: 'Errore durante l\'aggiunta di un dottore' });
    res.status(201).json({ status: 'Added', message: 'Dottore aggiunto con successo' });

    const inseretIdDoctor = results.insertId;

    if (specialities && specialities.length > 0) {
      const specialityValues = specialities.map(specialityId => [inseretIdDoctor, specialityId]);

      specialityValues.map(element => {
        connection.query(sqlInsBridgeTable, [element[0], element[1]], (err, results) => {
          console.log('Inserimento dati con successo')
        })
      })
    }

    addresses.map(element => {
      const { name_address, number, city, cap, province_of_city } = element;
      connection.query(sqlAddress, [name_address, number, city, cap, province_of_city], (err, results) => {
        const insertIdAddress = results.insertId;

        connection.query(sqlInsBridgeTableAddress, [inseretIdDoctor, insertIdAddress], (err, results) => {
          if (err) return res.status(500).json({ error: 'Errore durante l\'aggiunta dei dati nella tabella ponte' });
          console.log('dato inserito')
        })
      })
    })

  })
}

//Rotta store review (aggiungi una recensione ad un determinato dottore)
const storeReview = (req, res) => {
  const id = req.params.id
  const { full_name, title, description, vote, date } = req.body

  if (!full_name || !title || !description || !vote) {
    res.status(400).json({ error: 'Tutti i dati sono obbligatori' })
  }

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


module.exports = {
  indexDoctors,
  showDoctor,
  storeDoctor,
  storeReview,
  updateDoctor
}