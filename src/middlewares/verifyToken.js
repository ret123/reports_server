const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const config = require('../config/config'); // Ensure you have the JWT secret here

const auth = (...requiredRights) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log('--------------------------------------------------------');
    console.log(req.headers);
    console.log('--------------------------------------------------------');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {

      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, config.jwt.secret);
      if (decodedToken.type != "access") {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type');
      }
      // This checks both the token validity and expiry
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Token has expired');
      } else {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
      }
    }

    req.user = decodedToken;

    // if (requiredRights.length) {
    //   const userRights = roleRights.get(decodedToken.role);

    //   if (!userRights) {
    //     throw new ApiError(httpStatus.FORBIDDEN, 'Role does not have any rights');
    //   }

    //   const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    //   if (!hasRequiredRights) {
    //     throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    //   }
    // }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
