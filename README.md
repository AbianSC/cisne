Para ejecutar el proyecto:

Hacer un git clone de la rama asc, o bien hacer un git switch hacia ella en local.

Abrir el proyecto con el IDE oportuno.

Crear la base de datos MySQL en local con el nombre "cisne_db"

Crear el directorio /config/ dentro de /backend/ y dentro de /config/ el archivo db.config.js con el siguiente contenido ajustado a la configuración de bases de datos local:

module.exports = { HOST: process.env.DB_HOST || "localhost", USER: process.env.DB_USER || "root", PASSWORD: process.env.DB_PASS || "su_contraeña", DB: process.env.DB_NAME || "cisne_db", dialect: process.env.DB_DIALECT || "mysql", pool: { max: 5, min: 0, acquire: 30000, idle: 10000 } };

Modificar el archivo .env en base a nuestra configuración local para bases de datos.

Abrir un terminal bash en el directorio raíz del proyecto, hacer cd backend y ejecutar node index.js

Abrir un terminal bash en el directorio raíz del proyecto, hacer cd frontend y ejecutar ionic serve

¡Ya deberíamos tener la UI desplegada en nuestro navegador!
