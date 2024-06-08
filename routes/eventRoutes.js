const express = require('express');
const EventController = require('../controllers/EventController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', EventController.getAll);
router.get('/user', authMiddleware.authenticate, EventController.getUserEvents); // New route for user events
router.post('/', authMiddleware.authenticate, EventController.create);
router.put('/:id', authMiddleware.authenticate, EventController.update);
router.delete('/:id', authMiddleware.authenticate, EventController.delete);
router.post('/:id/rsvp', authMiddleware.authenticate, EventController.rsvp);

module.exports = router;
