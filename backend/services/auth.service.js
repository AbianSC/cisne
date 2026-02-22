const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../models");

const signToken = (user) => {
    return jwt.sign(
        { id: user.Id_user, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

// helper: "Juan Pérez" -> { firstname: "Juan", lastname: "Pérez" }
function splitFullName(fullName) {
    const clean = String(fullName || "").trim().replace(/\s+/g, " ");
    if (!clean) return { firstname: "", lastname: "" };

    const parts = clean.split(" ");
    const firstname = parts.shift() || "";
    const lastname = parts.join(" ") || ""; // puede quedar vacío si solo hay 1 palabra
    return { firstname, lastname };
}

function normalizeRole(role) {
    const allowed = ["PATIENT", "THERAPIST", "CENTRE"]; // 👈 no permitimos ADMIN desde registro público
    return allowed.includes(role) ? role : "PATIENT";
}

async function ensureUniqueEmail(email, t) {
    const exists = await db.User.findOne({ where: { email }, transaction: t });
    if (exists) {
        const err = new Error("El email ya está en uso.");
        err.status = 409;
        throw err;
    }
}

async function ensureUniqueNIF(nif, t) {
    if (!nif) return;

    const therapistNif = await db.Therapist.findOne({ where: { NIF: nif }, transaction: t });
    if (therapistNif) {
        const err = new Error("El NIF ya está registrado como terapeuta.");
        err.status = 409;
        throw err;
    }

    const patientNif = await db.Patient.findOne({ where: { NIF: nif }, transaction: t });
    if (patientNif) {
        const err = new Error("El NIF ya está registrado como paciente.");
        err.status = 409;
        throw err;
    }
}

async function ensureUniqueCIF(cif, t) {
    if (!cif) return;
    const existing = await db.Centre.findOne({ where: { CIF: cif }, transaction: t });
    if (existing) {
        const err = new Error("El CIF ya está registrado.");
        err.status = 409;
        throw err;
    }
}

async function createProfileByRole({ user, body, t }) {
    const role = user.role;
    

    if (role === "PATIENT") {
        const { fullName, nif, diagnosis } = body;
        if (!fullName || !nif) {
            const err = new Error("Para PACIENTE se requiere fullName y nif.");
            err.status = 400;
            throw err;
        }

        await ensureUniqueNIF(nif, t);

        const { firstname, lastname } = splitFullName(fullName);

        return db.Patient.create(
            {
                Id_user_patient: user.Id_user,
                firstname,
                lastname: lastname || "-", // si no hay apellidos, ponemos algo para no romper allowNull:false
                NIF: nif,
                phone: body.phone || null,
                diagnosis: diagnosis || null
            },
            { transaction: t }
        );
    }

    if (role === "THERAPIST") {
        const { fullName, nif, societyId, profession } = body;
        if (!fullName || !nif) {
            const err = new Error("Para TERAPEUTA se requiere fullName y nif.");
            err.status = 400;
            throw err;
        }

        await ensureUniqueNIF(nif, t);

        const { firstname, lastname } = splitFullName(fullName);

        return db.Therapist.create(
            {
                Id_user_therapist: user.Id_user,
                firstname,
                lastname: lastname || "-",
                NIF: nif,
                phone: body.phone || null,
                Society_Id: societyId || null,
                Profession: profession || null
            },
            { transaction: t }
        );
    }

    if (role === "CENTRE") {
        const cif = body.cif ?? body.CIF;
        const name = body.name ?? body.centreName ?? body.fullName;
        const phone = body.phone ?? body.Phone;
        const location = body.location ?? body.Location;

        if (!cif || !name || !location) {
            const err = new Error("Para CENTRO se requiere cif, name y location.");
            err.status = 400;
            throw err;
        }

        await ensureUniqueCIF(cif, t);

        return db.Centre.create(
            {
                Id_user_centre: user.Id_user,
                CIF: cif,
                name,
                phone: phone || null,
                location
            },
            { transaction: t }
        );
    }

    // No debería pasar por normalizeRole()
    const err = new Error("Rol no soportado.");
    err.status = 400;
    throw err;
}

exports.register = async (body) => {
    const t = await db.sequelize.transaction();

    try {
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");
        const role = normalizeRole(body.role);

        if (!email) {
            const err = new Error("Email es requerido.");
            err.status = 400;
            throw err;
        }
        if (!password || password.length < 6) {
            const err = new Error("Password debe tener mínimo 6 caracteres.");
            err.status = 400;
            throw err;
        }

        await ensureUniqueEmail(email, t);

        const hash = await bcrypt.hash(password, 10);

        const user = await db.User.create(
            {
                email,
                password: hash,
                role
            },
            { transaction: t }
        );

        // perfil según rol
        await createProfileByRole({ user, body, t });

        await t.commit();

        const token = signToken(user);

        return {
            token,
            user: { id: user.Id_user, email: user.email, role: user.role }
        };
    } catch (e) {
        await t.rollback();
        throw e;
    }
};

exports.login = async (body) => {
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
        const err = new Error("Email y password son requeridos.");
        err.status = 400;
        throw err;
    }

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
        const err = new Error("Credenciales incorrectas.");
        err.status = 401;
        throw err;
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        const err = new Error("Credenciales incorrectas.");
        err.status = 401;
        throw err;
    }

    const token = signToken(user);
    return { token, user: { id: user.Id_user, email: user.email, role: user.role } };
};