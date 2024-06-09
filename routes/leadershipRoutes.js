const express = require('express');
const LeadershipController = require('../controllers/LeadershipController');
const authMiddleware = require('../middleware/authMiddleware');
const { check } = require('express-validator');

const router = express.Router();

router.get('/', LeadershipController.getAll);
// router.post('/', authMiddleware.authenticate, LeadershipController.create);
// router.put('/:id', authMiddleware.authenticate, LeadershipController.update);
router.delete('/:id', authMiddleware.authenticate, LeadershipController.delete);

router.post('/',authMiddleware.authenticate,[
    check('firstName').not().isEmpty().withMessage('First name is required'),
    check('lastName').not().isEmpty().withMessage('Last name is required'),
    check('email').isEmail().withMessage('Invalid email format'),
    check('username').not().isEmpty().withMessage('Username is required'),
], LeadershipController.create);

router.put('/:id',authMiddleware.authenticate,[
    check('firstName').not().isEmpty().withMessage('First name is required'),
    check('lastName').not().isEmpty().withMessage('Last name is required'),
    check('email').isEmail().withMessage('Invalid email format'),
    check('username').not().isEmpty().withMessage('Username is required'),
], LeadershipController.update);

module.exports = router;
