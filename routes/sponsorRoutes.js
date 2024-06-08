const express = require('express');
const SponsorController = require('../controllers/SponsorController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', SponsorController.getAll);
router.post('/', authMiddleware.authenticate, SponsorController.create);
router.put('/:id', authMiddleware.authenticate, SponsorController.update);
router.delete('/:id', authMiddleware.authenticate, SponsorController.delete);

module.exports = router;
