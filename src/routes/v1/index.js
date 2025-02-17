const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const reportRoute = require('./report.route');

const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/reports',
    route: reportRoute,
  },
 

];



defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});


module.exports = router;
