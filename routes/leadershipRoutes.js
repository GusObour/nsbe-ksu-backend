const express = require('express');
const LeadershipController = require('../controllers/LeadershipController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', LeadershipController.getAll);
router.post('/', authMiddleware.authenticate, LeadershipController.create);
router.put('/:id', authMiddleware.authenticate, LeadershipController.update);
router.delete('/:id', authMiddleware.authenticate, LeadershipController.delete);

module.exports = router;
