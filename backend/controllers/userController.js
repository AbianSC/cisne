// controllers/userController.js
const { User, Centre, Therapist, Patient } = require('../models/cisne.model');

/**
 * Controlador de Usuarios
 * Maneja las operaciones CRUD para usuarios base del sistema
 */

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['Id_user', 'email'],
      include: [
        {
          model: Centre,
          as: 'centre',
          required: false
        },
        {
          model: Therapist,
          as: 'therapist',
          required: false
        },
        {
          model: Patient,
          as: 'patient',
          required: false
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// @desc    Obtener un usuario por ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        {
          model: Centre,
          as: 'centre',
          required: false
        },
        {
          model: Therapist,
          as: 'therapist',
          required: false
        },
        {
          model: Patient,
          as: 'patient',
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo usuario
// @route   POST /api/users
// @access  Public
exports.createUser = async (req, res) => {
  try {
    const { email } = req.body;

    // Validar campos requeridos
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es requerido'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    const user = await User.create({ email });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error en createUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
};

// @desc    Actualizar un usuario
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si el nuevo email ya existe (y no es el mismo usuario)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }

    await user.update({ email });

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error en updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

// @desc    Eliminar un usuario
// @route   DELETE /api/users/:id
// @access  Private
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

// @desc    Obtener tipo de usuario (centro, terapeuta o paciente)
// @route   GET /api/users/:id/type
// @access  Private
exports.getUserType = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        { model: Centre, as: 'centre', required: false },
        { model: Therapist, as: 'therapist', required: false },
        { model: Patient, as: 'patient', required: false }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    let userType = 'unassigned';
    let profile = null;

    if (user.centre) {
      userType = 'centre';
      profile = user.centre;
    } else if (user.therapist) {
      userType = 'therapist';
      profile = user.therapist;
    } else if (user.patient) {
      userType = 'patient';
      profile = user.patient;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          Id_user: user.Id_user,
          email: user.email
        },
        userType,
        profile
      }
    });
  } catch (error) {
    console.error('Error en getUserType:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipo de usuario',
      error: error.message
    });
  }
};

// @desc    Buscar usuarios por email
// @route   GET /api/users/search?email=xxx
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro email es requerido'
      });
    }

    const users = await User.findAll({
      where: {
        email: {
          [require('sequelize').Op.like]: `%${email}%`
        }
      },
      limit: 10
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error en searchUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar usuarios',
      error: error.message
    });
  }
};