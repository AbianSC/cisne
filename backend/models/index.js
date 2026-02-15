const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar todos los modelos desde cisne.model.js
const models = require("./cisne.model.js");

// Asignar los modelos al objeto db
db.User = models.User;
db.Invoice = models.Invoice;
db.ServiceInvoice = models.ServiceInvoice;
db.CourseInvoice = models.CourseInvoice;
db.Service = models.Service;
db.Course = models.Course;
db.Centre = models.Centre;
db.Therapist = models.Therapist;
db.Patient = models.Patient;
db.Resource = models.Resource;
db.Employs = models.Employs;
db.Treats = models.Treats;
db.Pays = models.Pays;
db.Posts = models.Posts;
db.Buys = models.Buys;
db.Publish = models.Publish;
db.Consume = models.Consume;
db.Creates = models.Creates;
db.Generates = models.Generates;

module.exports = db;