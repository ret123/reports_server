const httpStatus = require('http-status');
const axios = require('axios');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');


const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});



const login = catchAsync(async (req, res) => {
 
  const { email, password } = req.body;
  const data = await authService.loginUserWithEmailAndPassword(email, password);

  const user = {
    id: data.id,
    // organization_id: data.organization_id,
    // name: data.name

  }
 

  const tokens = await tokenService.generateAuthTokens(user);

  res.cookie('refreshToken', tokens.refresh.token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    // maxAge: 5000, 
  });
  res.send({ user:user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {

  const tokens = await authService.refreshAuth(req.cookies.refreshToken);
  res.cookie('refreshToken', tokens.refresh.token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    // maxAge:  1000, 
  });
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
