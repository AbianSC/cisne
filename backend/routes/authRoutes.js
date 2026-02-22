const router = require("express").Router();
const { body } = require("express-validator");

const auth = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authJwt");

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").isLength({ min: 6 }).withMessage("Password mínimo 6 caracteres"),
    body("role").optional().isIn(["CENTRE", "THERAPIST", "PATIENT"]).withMessage("Rol inválido"),

    // Si quieres validar también acceptTerms:
    body("acceptTerms").equals("true").withMessage("Debes aceptar términos"),

    // Campos condicionales (no obligatorio para todos, pero validamos si vienen)
    body("fullName").optional().isString().isLength({ min: 2 }),
    body("nif").optional().isString().isLength({ min: 6 }),
    body("cif").optional().isString().isLength({ min: 6 }),
    body("name").optional().isString().isLength({ min: 2 }),
    body("location").optional().isString().isLength({ min: 5 })
  ],
  auth.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("Password requerido")
  ],
  auth.login
);

router.get("/me", verifyToken, auth.me);

module.exports = router;

