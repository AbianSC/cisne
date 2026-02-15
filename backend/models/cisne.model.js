module.exports = (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const User = sequelize.define('User', {
    Id_user: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true }
  }, { tableName: 'USER', timestamps: false });

  const Invoice = sequelize.define('Invoice', {
    Id_Invoice: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Invoice_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    Invoice_date: { type: DataTypes.DATEONLY, allowNull: false },
    Tax_amount: { type: DataTypes.DECIMAL(10, 2) },
    Payment_method: { type: DataTypes.STRING(50) },
    Payment_status: { type: DataTypes.STRING(50) }
  }, { tableName: 'INVOICE', timestamps: false });

  const ServiceInvoice = sequelize.define('ServiceInvoice', {
    Id_service_invoice: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'INVOICE', key: 'Id_Invoice' }
    }
  }, { tableName: 'SERVICE_INVOICE', timestamps: false });

  const CourseInvoice = sequelize.define('CourseInvoice', {
    Id_course_invoice: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'INVOICE', key: 'Id_Invoice' }
    }
  }, { tableName: 'COURSE_INVOICE', timestamps: false });

  const Service = sequelize.define('Service', {
    Id_service: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_service_invoice: {
      type: DataTypes.INTEGER,
      references: { model: 'SERVICE_INVOICE', key: 'Id_service_invoice' }
    },
    Name: { type: DataTypes.STRING(100), allowNull: false },
    Price: { type: DataTypes.DECIMAL(10, 2) },
    Tools: { type: DataTypes.STRING(255) },
    Room: { type: DataTypes.STRING(50) },
    Service_Date: { type: DataTypes.DATEONLY }
  }, { tableName: 'SERVICE', timestamps: false });

  const Course = sequelize.define('Course', {
    Id_course: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_course_invoice: {
      type: DataTypes.INTEGER,
      references: { model: 'COURSE_INVOICE', key: 'Id_course_invoice' }
    },
    Name: { type: DataTypes.STRING(100), allowNull: false },
    Teacher: { type: DataTypes.STRING(100) },
    Price: { type: DataTypes.DECIMAL(10, 2) },
    Course_type: { type: DataTypes.STRING(50) },
    Course_description: { type: DataTypes.TEXT },
    Course_Date: { type: DataTypes.DATEONLY }
  }, { tableName: 'COURSE', timestamps: false });

  const Centre = sequelize.define('Centre', {
    Id_user_centre: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'USER', key: 'Id_user' }
    },
    CIF: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    location: { type: DataTypes.STRING(255) },
    Id_service: {
      type: DataTypes.INTEGER,
      references: { model: 'SERVICE', key: 'Id_service' }
    }
  }, { tableName: 'CENTRE', timestamps: false });

  const Therapist = sequelize.define('Therapist', {
    Id_user_therapist: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'USER', key: 'Id_user' }
    },
    NIF: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    Society_Id: { type: DataTypes.STRING(50) },
    Profession: { type: DataTypes.STRING(100) }
  }, { tableName: 'THERAPIST', timestamps: false });

  const Patient = sequelize.define('Patient', {
    Id_user_patient: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'USER', key: 'Id_user' }
    },
    NIF: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    diagnosis: { type: DataTypes.STRING(255) }
  }, { tableName: 'PATIENT', timestamps: false });

  const Resource = sequelize.define('Resource', {
    Id_resource: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Name: { type: DataTypes.STRING(100) },
    Resource_type: { type: DataTypes.STRING(50) },
    Resource_description: { type: DataTypes.TEXT }
  }, { tableName: 'RESOURCE', timestamps: false });

  // ===== Tablas puente (N:M)
  const Employs = sequelize.define('Employs', {
    Id_user_centre: { type: DataTypes.INTEGER, primaryKey: true },
    Id_user_therapist: { type: DataTypes.INTEGER, primaryKey: true },
    Contract: { type: DataTypes.STRING(100) }
  }, { tableName: 'EMPLOYS', timestamps: false });

  const Treats = sequelize.define('Treats', {
    Id_user_therapist: { type: DataTypes.INTEGER, primaryKey: true },
    Id_user_patient: { type: DataTypes.INTEGER, primaryKey: true },
    report: { type: DataTypes.TEXT }
  }, { tableName: 'TREATS', timestamps: false });

  const Pays = sequelize.define('Pays', {
    Id_user_patient: { type: DataTypes.INTEGER, primaryKey: true },
    Id_service: { type: DataTypes.INTEGER, primaryKey: true }
  }, { tableName: 'PAYS', timestamps: false });

  const Posts = sequelize.define('Posts', {
    Id_user_centre: { type: DataTypes.INTEGER, primaryKey: true },
    Id_course: { type: DataTypes.INTEGER, primaryKey: true },
    Post_date: { type: DataTypes.DATEONLY }
  }, { tableName: 'POSTS', timestamps: false });

  const Buys = sequelize.define('Buys', {
    Id_user_therapist: { type: DataTypes.INTEGER, primaryKey: true },
    Id_course: { type: DataTypes.INTEGER, primaryKey: true },
    Buying_date: { type: DataTypes.DATEONLY }
  }, { tableName: 'BUYS', timestamps: false });

  const Publish = sequelize.define('Publish', {
    Id_user_therapist: { type: DataTypes.INTEGER, primaryKey: true },
    Id_resource: { type: DataTypes.INTEGER, primaryKey: true },
    Publication_date: { type: DataTypes.DATEONLY }
  }, { tableName: 'PUBLISH', timestamps: false });

  const Consume = sequelize.define('Consume', {
    Id_user_patient: { type: DataTypes.INTEGER, primaryKey: true },
    Id_resource: { type: DataTypes.INTEGER, primaryKey: true }
  }, { tableName: 'CONSUME', timestamps: false });

  const Creates = sequelize.define('Creates', {
    Id_service: { type: DataTypes.INTEGER, primaryKey: true },
    Id_service_invoice: { type: DataTypes.INTEGER, primaryKey: true }
  }, { tableName: 'CREATES', timestamps: false });

  const Generates = sequelize.define('Generates', {
    Id_course: { type: DataTypes.INTEGER, primaryKey: true },
    Id_course_invoice: { type: DataTypes.INTEGER, primaryKey: true }
  }, { tableName: 'GENERATES', timestamps: false });

  // ===== Asociaciones ======
  User.hasOne(Centre, { foreignKey: 'Id_user_centre', as: 'centre' });
  User.hasOne(Therapist, { foreignKey: 'Id_user_therapist', as: 'therapist' });
  User.hasOne(Patient, { foreignKey: 'Id_user_patient', as: 'patient' });

  Invoice.hasOne(ServiceInvoice, { foreignKey: 'Id_service_invoice' });
  Invoice.hasOne(CourseInvoice, { foreignKey: 'Id_course_invoice' });

  ServiceInvoice.belongsTo(Invoice, { foreignKey: 'Id_service_invoice' });
  CourseInvoice.belongsTo(Invoice, { foreignKey: 'Id_course_invoice' });

  Service.belongsTo(ServiceInvoice, { foreignKey: 'Id_service_invoice' });
  ServiceInvoice.hasMany(Service, { foreignKey: 'Id_service_invoice' });

  Course.belongsTo(CourseInvoice, { foreignKey: 'Id_course_invoice' });
  CourseInvoice.hasMany(Course, { foreignKey: 'Id_course_invoice' });

  Centre.belongsTo(User, { foreignKey: 'Id_user_centre' });
  Therapist.belongsTo(User, { foreignKey: 'Id_user_therapist' });
  Patient.belongsTo(User, { foreignKey: 'Id_user_patient' });

  Centre.belongsToMany(Therapist, { through: Employs, foreignKey: 'Id_user_centre', otherKey: 'Id_user_therapist', as: 'therapists' });
  Therapist.belongsToMany(Centre, { through: Employs, foreignKey: 'Id_user_therapist', otherKey: 'Id_user_centre', as: 'centres' });

  Therapist.belongsToMany(Patient, { through: Treats, foreignKey: 'Id_user_therapist', otherKey: 'Id_user_patient', as: 'patients' });
  Patient.belongsToMany(Therapist, { through: Treats, foreignKey: 'Id_user_patient', otherKey: 'Id_user_therapist', as: 'therapists' });

  Patient.belongsToMany(Service, { through: Pays, foreignKey: 'Id_user_patient', otherKey: 'Id_service', as: 'services' });
  Service.belongsToMany(Patient, { through: Pays, foreignKey: 'Id_service', otherKey: 'Id_user_patient', as: 'patients' });

  Centre.belongsToMany(Course, { through: Posts, foreignKey: 'Id_user_centre', otherKey: 'Id_course', as: 'courses' });
  Course.belongsToMany(Centre, { through: Posts, foreignKey: 'Id_course', otherKey: 'Id_user_centre', as: 'centres' });

  Therapist.belongsToMany(Course, { through: Buys, foreignKey: 'Id_user_therapist', otherKey: 'Id_course', as: 'courses' });
  Course.belongsToMany(Therapist, { through: Buys, foreignKey: 'Id_course', otherKey: 'Id_user_therapist', as: 'therapists' });

  Therapist.belongsToMany(Resource, { through: Publish, foreignKey: 'Id_user_therapist', otherKey: 'Id_resource', as: 'resources' });
  Resource.belongsToMany(Therapist, { through: Publish, foreignKey: 'Id_resource', otherKey: 'Id_user_therapist', as: 'publishers' });

  Patient.belongsToMany(Resource, { through: Consume, foreignKey: 'Id_user_patient', otherKey: 'Id_resource', as: 'resources' });
  Resource.belongsToMany(Patient, { through: Consume, foreignKey: 'Id_resource', otherKey: 'Id_user_patient', as: 'consumers' });

  return {
    User,
    Invoice,
    ServiceInvoice,
    CourseInvoice,
    Service,
    Course,
    Centre,
    Therapist,
    Patient,
    Resource,
    Employs,
    Treats,
    Pays,
    Posts,
    Buys,
    Publish,
    Consume,
    Creates,
    Generates
  };
};
