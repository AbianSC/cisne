// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserType,
  searchUsers
} = require('../controllers/userController');

// Rutas base
router.route('/')
  .get(getAllUsers)
  .post(createUser);

// Búsqueda
router.get('/search', searchUsers);

// Rutas por ID
router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

// Tipo de usuario
router.get('/:id/type', getUserType);

module.exports = router;