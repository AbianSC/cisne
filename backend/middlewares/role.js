exports.allowRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "No tienes permisos para esta acción" });
    }

    next();
  };
};