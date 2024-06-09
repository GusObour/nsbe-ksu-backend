const express = require('express');
const { check } = require('express-validator');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Registration Route
router.post(
  '/register',
  [
    check('firstName').not().isEmpty().withMessage('First name is required'),
    check('lastName').not().isEmpty().withMessage('Last name is required'),
    check('email').isEmail().withMessage('Invalid email format'),
    check('username').not().isEmpty().withMessage('Username is required'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    check('isLeader').optional().isBoolean().withMessage('isLeader must be a boolean'),
  ],
  AuthController.register
);

// Login Route
router.post(
  '/login',
  [
    check('username').not().isEmpty().withMessage('Username is required'),
    check('password').not().isEmpty().withMessage('Password is required'),
  ],
  AuthController.login
);

// Update Profile Route
router.put(
  '/updateProfile',
  authMiddleware.authenticate,
  [
    check('firstName').not().isEmpty().withMessage('First name is required'),
    check('lastName').not().isEmpty().withMessage('Last name is required'),
    check('email').isEmail().withMessage('Invalid email format'),
    check('username').not().isEmpty().withMessage('Username is required'),
  ],
  AuthController.updateProfile
);

// Change Password Route
router.put(
  '/changePassword',
  authMiddleware.authenticate,
  [
    check('currentPassword').not().isEmpty().withMessage('Current password is required'),
    check('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 6 characters long'),
  ],
  AuthController.changePassword
);

// Logout Route
router.post('/logout', AuthController.logout);

// Get Session Route
router.get('/session', AuthController.getSession);

module.exports = router;
