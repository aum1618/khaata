const requireRole = (...roles) => {
	const allowedRoles = roles.flat();
	return (req, res, next) => {
		if (!req.user || !req.user.role) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ message: "Forbidden" });
		}

		return next();
	};
};

module.exports = requireRole;
