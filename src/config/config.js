const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');


dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(1337),
    // BASE_URL: Joi.string().required().description('base url'),
    // MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),

    MYSQL_HOST_DEV: Joi.string().description('the  MYSQL developemnt server host address'),
    MYSQL_USER_DEV: Joi.string().description('the  MYSQL developemnt server user name '),
    MYSQL_PASSWORD_DEV: Joi.string().allow('').description('the MYSQL developemnt server users password '),
    MYSQL_DATABASE_DEV: Joi.string().description('the MYSQL developemnt server database name '),
    MYSQL_PORT_DEV: Joi.string().description('the MYSQL developemnt server port number  '),

    MYSQL_HOST_TEST: Joi.string().description('the MYSQL test server host address'),
    MYSQL_USER_TEST: Joi.string().description('the  MYSQL test server user name '),
    MYSQL_PASSWORD_TEST: Joi.string().allow('').description('the  MYSQL test server users password '),
    MYSQL_DATABASE_TEST: Joi.string().description('the  MYSQL test server database name '),
    MYSQL_PORT_TEST: Joi.string().description('the  MYSQL test server port number  '),

    MYSQL_HOST_PROD: Joi.string().description('the  MYSQL production server host address'),
    MYSQL_USER_PROD: Joi.string().description('the  MYSQL production server user name '),
    MYSQL_PASSWORD_PROD: Joi.string().description('the MYSQL production server users password '),
    MYSQL_DATABASE_PROD: Joi.string().description('the MYSQL production server database name '),
    MYSQL_PORT_PROD: Joi.string().description('the  MYSQL production server port number  '),


  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  base_url: envVars.BASE_URL,
  development: {
    username: envVars.MYSQL_USER_DEV,
    password: envVars.MYSQL_PASSWORD_DEV,
    database: envVars.MYSQL_DATABASE_DEV,
    host: envVars.MYSQL_HOST_DEV,
    port: envVars.MYSQL_PORT_DEV,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
  test: {
    username: envVars.MYSQL_USER_TEST,
    password: envVars.MYSQL_PASSWORD_TEST,
    database: envVars.MYSQL_DATABASE_TEST,
    host: envVars.MYSQL_HOST_TEST,
    port: envVars.MYSQL_PORT_TEST,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
  production: {
    username: envVars.MYSQL_USER_PROD,
    password: envVars.MYSQL_PASSWORD_PROD,
    database: envVars.MYSQL_DATABASE_PROD,
    host: envVars.MYSQL_HOST_PROD,
    port: envVars.MYSQL_PORT_PROD,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true,
    },
  },

  newTenant: {
    username: process.env.MYSQL_USER_TENANT,
    password: process.env.MYSQL_PASSWORD_TENANT,
    host: process.env.MYSQL_HOST_TENANT,
    port: process.env.MYSQL_PORT_TENANT,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true,
    },
  },

  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },


 
};
