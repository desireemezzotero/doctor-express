// controller show
const show = (req, res) => {
    const id = req.params.id;
    res.send(`Dettagli del dottore con id ${id}`)
}

module.exports = {
    show
}