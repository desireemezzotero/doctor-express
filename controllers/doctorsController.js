const connection = require('../data/db');


//Rotta index doctors (visualizza tutti i dottori)
const indexDoctors = (req, res) => {
  // Salvo nel caso ci fosse, la specializzazione filtrata dalla request
  const specialitySearched = req.body.specialitySearched;

  const sql = `
    SELECT doctors.*, 
    (SELECT ROUND(AVG(reviews.vote), 1) 
    FROM reviews 
    WHERE reviews.doctor_id = doctors.id) AS average_vote,
    (SELECT COUNT(reviews.vote) 
    FROM reviews 
    WHERE reviews.doctor_id = doctors.id) AS reviews_count,
    GROUP_CONCAT(DISTINCT specialities.name ORDER BY specialities.name ASC SEPARATOR ', ') AS name_speciality
    FROM doctors
    JOIN doctor_speciality ON doctors.id = doctor_speciality.doctor_id
    JOIN specialities ON doctor_speciality.speciality_id = specialities.id
    WHERE (COALESCE(NULLIF(?, ''), NULL) IS NULL OR specialities.name = ?)
    GROUP BY doctors.id
    ORDER BY average_vote DESC, reviews_count DESC;  -- Ordina prima per average_vote e poi per reviews_count
  `;

  const sqlSpecialities = 'SELECT * FROM specialities'

  connection.query(sql, [specialitySearched, specialitySearched], (err, results) => {
    if (err) return res.status(500).json({ err: 'query al db fallita' });

    let doctors = [];
    results.map(doctor => {
      let defaultDoctorImage = `${req.protocol}://${req.get('host')}/img/doctor_img/${doctor.image}`;

      // Logica di controllo per assenza di immagine
      if (doctor.image === null && doctor.gender === 'M') {
        defaultDoctorImage = `${req.protocol}://${req.get('host')}/img/doctor_img/placeholder_male.jpg`;
      } else if (doctor.image === null && doctor.gender === 'F') {
        defaultDoctorImage = `${req.protocol}://${req.get('host')}/img/doctor_img/placeholder_female.jpg`;
      }

      const completeDoctor = {
        ...doctor,
        image_url: defaultDoctorImage
      };

      doctors.push(completeDoctor);
    });

    let speciality = []
    connection.query(sqlSpecialities, (err, specialitiesResults) => {
      if (err) return res.status(500).json({ error: 'Query error on database' });
      specialitiesResults.map(resul => {
        const specialitiesComplete = {
          id: resul.id,
          name: resul.name,
          description: resul.description,
          icon: `${req.protocol}://${req.get('host')}/img/specialities_png/${resul.icon}`
        }
        speciality.push(specialitiesComplete)
      })
      res.json({ doctors, speciality });
    })
  });
};


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
    d.gender AS gender,
    d.name_address AS address,
    ROUND(AVG(R.vote),1) AS average_vote,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'specialityName', s.name, 
        'specialityDescription', s.description,
        'specialityIcon', s.icon
      )
    ) AS specializations,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', r.id,
        'vote', r.vote,
        'title', r.title,
        'description', r.description,
        'date', r.created_at,
        'name', r.full_name
      )
    ) AS reviews
    FROM doctors d
    LEFT JOIN doctor_speciality ds ON d.id = ds.doctor_id
    LEFT JOIN specialities s ON ds.speciality_id = s.id
    LEFT JOIN reviews r ON d.id = r.doctor_id
    WHERE d.id = ?
    GROUP BY d.id, d.name, d.surname, d.telephone, d.email, d.name_address, d.image;
  `;

  connection.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Query error on database' });
    if (results.length === 0 || results[0].doctorId === null) return res.status(404).json({ error: 'Query error on database' });

    //Funzione per il filtraggio dei dati duplicati
    const filterData = (array, key) => {
      return array.reduce((accumulator, current) => {
        if (!accumulator.some(element => element[key] === current[key])) {
          accumulator.push(current)
        }
        return accumulator;
      }, [])
    }

    //Eliminazione duplicati in specialities
    let specialitiesArray = filterData(results[0].specializations, 'specialityName');
    //Eliminazione duplicati in reviews
    let reviewsArray = filterData(results[0].reviews, 'id');

    //Logica per comporre l'array delle specializzazioni con tutti i dati completi
    const completeSpecialitesArray = [];
    specialitiesArray.map(element => {
      const completedObject = {
        specialityIcon: `${req.protocol}://${req.get('host')}/img/specialities_png/${element.specialityIcon}`,
        specialityName: element.specialityName,
        specialityDescription: element.specialityDescription
      }
      completeSpecialitesArray.push(completedObject)
    })

    // Funzione per ottenere l'URL del placeholder in base al genere
    function getPlaceholderUrl(gender) {
      return gender === 'M' ? 'placeholder_male.jpg' : 'placeholder_female.jpg';
    }

    // Funzione per ottenere l'URL dell'immagine
    function getImageUrl(protocol, host, image, gender) {

      return image
        ? `${protocol}://${host}/img/doctor_img/${image}`
        : `${protocol}://${host}/img/doctor_img/${getPlaceholderUrl(gender)}`
    }

    // Creazione dell'URL dell'immagine
    const imageUrl = getImageUrl(req.protocol, req.get('host'), results[0].image, results[0].gender);

    //Composizione finale dell'elemento doctor, con tutti i parametri corretti
    const doctor = {
      ...results[0],
      specializations: completeSpecialitesArray,
      reviews: reviewsArray,
      image_url: imageUrl
    };

    res.json(doctor);
  });
};

//Rotta store doctor (aggiungi un dottore e i relativi dati)
const storeDoctor = (req, res) => {
  const { name, surname, telephone, email, specialities, name_address, gender } = req.body;
  
  /* controllo nome */
  if (!name || name.length <= 3) {
    console.log('Il nome deve contenere almeno 3 caratteri')
    return res.status(400).json({ message: 'Il nome deve contenere almeno 3 caratteri' });
  }

  /* controllo cognome */
  if (!surname || surname.length <= 3) {
    console.log('Il cognome deve contenere almeno 3 caratteri')
    return res.status(400).json({ message: 'Il cognome deve contenere almeno 3 caratteri' });
  }

  if (!name || !surname || !telephone || !email || !specialities || !name_address || !gender) {
    res.status(400).json({ error: 'Tutti i dati sono obbligatori' })
  }

  else if(name_address.length < 5){
    res.status(400).json({ error: 'Indirizzo troppo breve' })
  }

  
  
  let imageName = req.file.filename;
  
  if (imageName.includes('placeholder')) {
    imageName = null;
  }
  
  const specialitiesSplit = specialities?.split(',');
  const specialitiesNumber = specialitiesSplit.map(Number);
  
  const sql = 'INSERT INTO doctors (name, surname, telephone, email, image, name_address, gender) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const sqlInsBridgeTable = 'INSERT INTO doctor_speciality (doctor_id, speciality_id) VALUES (?, ?)';

  
  //Aggiunta dati nella tabella doctors al DataBase
    connection.query(sql, [name, surname, telephone, email, imageName, name_address, gender], (err, results) => {
         if (err) return res.status(500).json({ error: 'Errore durante l\'aggiunta di un dottore' });
         const inseretIdDoctor = results.insertId
    
          if (specialitiesNumber && specialitiesNumber.length > 0) {
             const specialityValues = specialitiesNumber.map(specialityId => [inseretIdDoctor, specialityId])
             specialityValues.map(element => {
              // Aggiunta dei dati nella tabella ponte tra doctors e specialities al DataBase
                 connection.query(sqlInsBridgeTable, [element[0], element[1]], (err, results) => {
                 console.log('Inserimento dati con successo')
                 })
              })
           }
           res.status(201).json({ status: 'Added', message: 'Dottore aggiunto con successo' })
    })  
}

//Rotta store review (aggiungi una recensione ad un determinato dottore)
const storeReview = (req, res) => {
  const id = req.params.id
  const { full_name, title, description, vote } = req.body

  if (!full_name || !title || !description || !vote) {
    res.status(400).json({ error: 'Tutti i dati sono obbligatori' })
  }

  const sql = 'INSERT INTO doctors_db.reviews (doctor_id, full_name, title, description, vote) VALUES(?, ?, ?, ?, ?)'
  //Aggiunta dei dati nella tabella reviews al DataBase
  connection.query(
    sql,
    [id, full_name, title, description, vote],
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


//Rotta per i dottori con una determinata specializzazione
const specialitiesSelect = (req, res) => {
  const id = req.params.id

  const sql = `SELECT doctors.name, doctors.surname, doctors.image, doctors.gender,
      (SELECT ROUND(AVG(reviews.vote), 1) 
      FROM reviews 
      WHERE reviews.doctor_id = doctors.id) AS average_vote,
      (SELECT COUNT(reviews.vote) 
      FROM reviews 
      WHERE reviews.doctor_id = doctors.id) AS reviews_count,
      GROUP_CONCAT(DISTINCT specialities.name ORDER BY specialities.name ASC SEPARATOR ', ') AS name_speciality
      FROM doctors
      JOIN doctor_speciality ON doctors.id = doctor_speciality.doctor_id
      JOIN specialities ON doctor_speciality.speciality_id = specialities.id
      WHERE doctors.id IN (
      SELECT doctor_speciality.doctor_id
      FROM doctor_speciality
      JOIN specialities ON doctor_speciality.speciality_id = specialities.id
      WHERE specialities.id = ? )
      GROUP BY doctors.id
      ORDER BY average_vote DESC, reviews_count DESC;`

  connection.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Errore nella query del database' });
    if (results.length === 0 || results[0].doctorId === null) return res.status(404).json({ error: 'Nessun dottore con questa specializzazione' });

    let specialitiesArray = []

    results.map(element => {
      let defaultDoctorImage = `${req.protocol}://${req.get('host')}/img/doctor_img/${element.image}`;
      // Logica di controllo per assenza di immagine
      if (element.image === null && element.gender === 'M') {
        defaultDoctorImage = `${req.protocol}://${req.get('host')}/img/doctor_img/placeholder_male.jpg`;
      } else if (element.image === null && element.gender === 'F') {
        defaultDoctorImage = `${req.protocol}://${req.get('host')}/img/doctor_img/placeholder_female.jpg`;
      }

      const newObjectSpeciality = {
        ...element,
        image_url: defaultDoctorImage
      };
      specialitiesArray.push(newObjectSpeciality);
    });


    res.json(specialitiesArray);
  })
}

//rotta per stampare i dottori con una recensione
const reviewsDoctor = (req,res) => {
 const vote = req.params.id

 const sql = ` SELECT doctors.name, doctors.id,
               (SELECT ROUND(AVG(reviews.vote), 1) 
               FROM reviews 
               WHERE reviews.doctor_id = doctors.id) AS average_vote
               FROM doctors
               HAVING average_vote = ?
               ORDER BY average_vote DESC;`

  connection.query(sql, [vote], (err,results) => {
    if (err) return res.status(500).json({ error: 'Errore nella query del database' });
    if (results.length === 0 || results[0].doctorId === null) return res.status(404).json({ error: 'nessun dottore trovato' });
    res.json(results)
  })
}

module.exports = {
  indexDoctors,
  showDoctor,
  storeDoctor,
  storeReview,
  updateDoctor,
  specialitiesSelect,
  reviewsDoctor,
}