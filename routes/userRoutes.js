const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

//Users Routers
router.route('/')
      .get(userController.getUser)
      .post(userController.createUser);

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);

router.route('/:id')
      .get(userController.getUserById)
      .patch(userController.updateUser)
      .delete(userController.deleteUser);

module.exports = router;