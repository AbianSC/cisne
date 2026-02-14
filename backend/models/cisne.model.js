const dbConfig = require('../config/db.config');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool
  }
);

const User = sequelize.define('User', {
  Id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'USER',
  timestamps: false
});

const Invoice = sequelize.define('Invoice', {
  Id_Invoice: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Invoice_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  Invoice_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  Tax_amount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Payment_method: {
    type: DataTypes.STRING(50)
  },
  Payment_status: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'INVOICE',
  timestamps: false
});

const ServiceInvoice = sequelize.define('ServiceInvoice', {
  Id_service_invoice: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'INVOICE',
      key: 'Id_Invoice'
    }
  }
}, {
  tableName: 'SERVICE_INVOICE',
  timestamps: false
});

const CourseInvoice = sequelize.define('CourseInvoice', {
  Id_course_invoice: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'INVOICE',
      key: 'Id_Invoice'
    }
  }
}, {
  tableName: 'COURSE_INVOICE',
  timestamps: false
});

const Service = sequelize.define('Service', {
  Id_service: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Id_service_invoice: {
    type: DataTypes.INTEGER,
    references: {
      model: 'SERVICE_INVOICE',
      key: 'Id_service_invoice'
    }
  },
  Name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Tools: {
    type: DataTypes.STRING(255)
  },
  Room: {
    type: DataTypes.STRING(50)
  },
  Service_Date: {
    type: DataTypes.DATEONLY
  }
}, {
  tableName: 'SERVICE',
  timestamps: false
});

const Course = sequelize.define('Course', {
  Id_course: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Id_course_invoice: {
    type: DataTypes.INTEGER,
    references: {
      model: 'COURSE_INVOICE',
      key: 'Id_course_invoice'
    }
  },
  Name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Teacher: {
    type: DataTypes.STRING(100)
  },
  Price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Course_type: {
    type: DataTypes.STRING(50)
  },
  Course_description: {
    type: DataTypes.TEXT
  },
  Course_Date: {
    type: DataTypes.DATEONLY
  }
}, {
  tableName: 'COURSE',
  timestamps: false
});

const Centre = sequelize.define('Centre', {
  Id_user_centre: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'USER',
      key: 'Id_user'
    }
  },
  CIF: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  location: {
    type: DataTypes.STRING(255)
  },
  Id_service: {
    type: DataTypes.INTEGER,
    references: {
      model: 'SERVICE',
      key: 'Id_service'
    }
  }
}, {
  tableName: 'CENTRE',
  timestamps: false
});

const Therapist = sequelize.define('Therapist', {
  Id_user_therapist: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'USER',
      key: 'Id_user'
    }
  },
  NIF: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  Society_Id: {
    type: DataTypes.STRING(50)
  },
  Profession: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'THERAPIST',
  timestamps: false
});

const Patient = sequelize.define('Patient', {
  Id_user_patient: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'USER',
      key: 'Id_user'
    }
  },
  NIF: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  diagnosis: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'PATIENT',
  timestamps: false
});

const Resource = sequelize.define('Resource', {
  Id_resource: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Name: {
    type: DataTypes.STRING(100)
  },
  Resource_type: {
    type: DataTypes.STRING(50)
  },
  Resource_description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'RESOURCE',
  timestamps: false
});

// ==================== TABLAS DE RELACIÓN (MANY-TO-MANY) ====================

const Employs = sequelize.define('Employs', {
  Id_user_centre: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'CENTRE',
      key: 'Id_user_centre'
    }
  },
  Id_user_therapist: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'THERAPIST',
      key: 'Id_user_therapist'
    }
  },
  Contract: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'EMPLOYS',
  timestamps: false
});

const Treats = sequelize.define('Treats', {
  Id_user_therapist: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'THERAPIST',
      key: 'Id_user_therapist'
    }
  },
  Id_user_patient: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'PATIENT',
      key: 'Id_user_patient'
    }
  },
  report: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'TREATS',
  timestamps: false
});

const Pays = sequelize.define('Pays', {
  Id_user_patient: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'PATIENT',
      key: 'Id_user_patient'
    }
  },
  Id_service: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'SERVICE',
      key: 'Id_service'
    }
  }
}, {
  tableName: 'PAYS',
  timestamps: false
});

const Posts = sequelize.define('Posts', {
  Id_user_centre: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'CENTRE',
      key: 'Id_user_centre'
    }
  },
  Id_course: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'COURSE',
      key: 'Id_course'
    }
  },
  Post_date: {
    type: DataTypes.DATEONLY
  }
}, {
  tableName: 'POSTS',
  timestamps: false
});

const Buys = sequelize.define('Buys', {
  Id_user_therapist: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'THERAPIST',
      key: 'Id_user_therapist'
    }
  },
  Id_course: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'COURSE',
      key: 'Id_course'
    }
  },
  Buying_date: {
    type: DataTypes.DATEONLY
  }
}, {
  tableName: 'BUYS',
  timestamps: false
});

const Publish = sequelize.define('Publish', {
  Id_user_therapist: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'THERAPIST',
      key: 'Id_user_therapist'
    }
  },
  Id_resource: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'RESOURCE',
      key: 'Id_resource'
    }
  },
  Publication_date: {
    type: DataTypes.DATEONLY
  }
}, {
  tableName: 'PUBLISH',
  timestamps: false
});

const Consume = sequelize.define('Consume', {
  Id_user_patient: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'PATIENT',
      key: 'Id_user_patient'
    }
  },
  Id_resource: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'RESOURCE',
      key: 'Id_resource'
    }
  }
}, {
  tableName: 'CONSUME',
  timestamps: false
});

const Creates = sequelize.define('Creates', {
  Id_service: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'SERVICE',
      key: 'Id_service'
    }
  },
  Id_service_invoice: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'SERVICE_INVOICE',
      key: 'Id_service_invoice'
    }
  }
}, {
  tableName: 'CREATES',
  timestamps: false
});

const Generates = sequelize.define('Generates', {
  Id_course: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'COURSE',
      key: 'Id_course'
    }
  },
  Id_course_invoice: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'COURSE_INVOICE',
      key: 'Id_course_invoice'
    }
  }
}, {
  tableName: 'GENERATES',
  timestamps: false
});

// ==================== DEFINICIÓN DE ASOCIACIONES ====================

// User associations
User.hasOne(Centre, { foreignKey: 'Id_user_centre', as: 'centre' });
User.hasOne(Therapist, { foreignKey: 'Id_user_therapist', as: 'therapist' });
User.hasOne(Patient, { foreignKey: 'Id_user_patient', as: 'patient' });

// Invoice associations
Invoice.hasOne(ServiceInvoice, { foreignKey: 'Id_service_invoice' });
Invoice.hasOne(CourseInvoice, { foreignKey: 'Id_course_invoice' });

ServiceInvoice.belongsTo(Invoice, { foreignKey: 'Id_service_invoice' });
CourseInvoice.belongsTo(Invoice, { foreignKey: 'Id_course_invoice' });

// Service associations
Service.belongsTo(ServiceInvoice, { foreignKey: 'Id_service_invoice' });
ServiceInvoice.hasMany(Service, { foreignKey: 'Id_service_invoice' });

// Course associations
Course.belongsTo(CourseInvoice, { foreignKey: 'Id_course_invoice' });
CourseInvoice.hasMany(Course, { foreignKey: 'Id_course_invoice' });

// Centre associations
Centre.belongsTo(User, { foreignKey: 'Id_user_centre' });
Centre.belongsTo(Service, { foreignKey: 'Id_service' });

// Therapist associations
Therapist.belongsTo(User, { foreignKey: 'Id_user_therapist' });

// Patient associations
Patient.belongsTo(User, { foreignKey: 'Id_user_patient' });

// Many-to-Many: Centre - Therapist (EMPLOYS)
Centre.belongsToMany(Therapist, {
  through: Employs,
  foreignKey: 'Id_user_centre',
  otherKey: 'Id_user_therapist',
  as: 'therapists'
});
Therapist.belongsToMany(Centre, {
  through: Employs,
  foreignKey: 'Id_user_therapist',
  otherKey: 'Id_user_centre',
  as: 'centres'
});

// Many-to-Many: Therapist - Patient (TREATS)
Therapist.belongsToMany(Patient, {
  through: Treats,
  foreignKey: 'Id_user_therapist',
  otherKey: 'Id_user_patient',
  as: 'patients'
});
Patient.belongsToMany(Therapist, {
  through: Treats,
  foreignKey: 'Id_user_patient',
  otherKey: 'Id_user_therapist',
  as: 'therapists'
});

// Many-to-Many: Patient - Service (PAYS)
Patient.belongsToMany(Service, {
  through: Pays,
  foreignKey: 'Id_user_patient',
  otherKey: 'Id_service',
  as: 'services'
});
Service.belongsToMany(Patient, {
  through: Pays,
  foreignKey: 'Id_service',
  otherKey: 'Id_user_patient',
  as: 'patients'
});

// Many-to-Many: Centre - Course (POSTS)
Centre.belongsToMany(Course, {
  through: Posts,
  foreignKey: 'Id_user_centre',
  otherKey: 'Id_course',
  as: 'courses'
});
Course.belongsToMany(Centre, {
  through: Posts,
  foreignKey: 'Id_course',
  otherKey: 'Id_user_centre',
  as: 'centres'
});

// Many-to-Many: Therapist - Course (BUYS)
Therapist.belongsToMany(Course, {
  through: Buys,
  foreignKey: 'Id_user_therapist',
  otherKey: 'Id_course',
  as: 'courses'
});
Course.belongsToMany(Therapist, {
  through: Buys,
  foreignKey: 'Id_course',
  otherKey: 'Id_user_therapist',
  as: 'therapists'
});

// Many-to-Many: Therapist - Resource (PUBLISH)
Therapist.belongsToMany(Resource, {
  through: Publish,
  foreignKey: 'Id_user_therapist',
  otherKey: 'Id_resource',
  as: 'resources'
});
Resource.belongsToMany(Therapist, {
  through: Publish,
  foreignKey: 'Id_resource',
  otherKey: 'Id_user_therapist',
  as: 'publishers'
});

// Many-to-Many: Patient - Resource (CONSUME)
Patient.belongsToMany(Resource, {
  through: Consume,
  foreignKey: 'Id_user_patient',
  otherKey: 'Id_resource',
  as: 'resources'
});
Resource.belongsToMany(Patient, {
  through: Consume,
  foreignKey: 'Id_resource',
  otherKey: 'Id_user_patient',
  as: 'consumers'
});

// Many-to-Many: Service - ServiceInvoice (CREATES)
Service.belongsToMany(ServiceInvoice, {
  through: Creates,
  foreignKey: 'Id_service',
  otherKey: 'Id_service_invoice',
  as: 'invoices'
});
ServiceInvoice.belongsToMany(Service, {
  through: Creates,
  foreignKey: 'Id_service_invoice',
  otherKey: 'Id_service',
  as: 'services'
});

// Many-to-Many: Course - CourseInvoice (GENERATES)
Course.belongsToMany(CourseInvoice, {
  through: Generates,
  foreignKey: 'Id_course',
  otherKey: 'Id_course_invoice',
  as: 'invoices'
});
CourseInvoice.belongsToMany(Course, {
  through: Generates,
  foreignKey: 'Id_course_invoice',
  otherKey: 'Id_course',
  as: 'courses'
});

module.exports = {
  sequelize,
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