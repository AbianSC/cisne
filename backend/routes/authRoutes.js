const router = require("express").Router();
const { body } = require("express-validator");

const auth = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authJwt");

router.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("role").optional().isIn(["ADMIN", "CENTRE", "THERAPIST", "PATIENT"])
  ],
  auth.register
);

router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").notEmpty()
  ],
  auth.login
);

router.get("/me", verifyToken, auth.me);

module.exports = router;

