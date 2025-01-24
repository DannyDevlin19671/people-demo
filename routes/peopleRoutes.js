const express = require('express');
const { getPeople, createPerson, updatePerson, deletePerson } = require('../controllers/peopleController');

const router = express.Router();

router.get('/', getPeople);
router.post('/', createPerson);
router.put('/:id', updatePerson);
router.delete('/:id', deletePerson);

module.exports = router;
