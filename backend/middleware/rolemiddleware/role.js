const { responseBody } = require('../../config/responseBody');


function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json(
          responseBody(
            403,
            'Access denied: Insufficient permissions',
            null
          )
        );
    }

    next();
  };
}

module.exports ={
  authorizeRoles
}
 