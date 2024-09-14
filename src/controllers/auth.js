import createHttpError from 'http-errors';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokens,
  patchUser,
} from '../services/auth.js';

import { setupCookie } from '../utilts/setupCookie.js';

export async function registerUserController(req, res) {
  const payload = {
    email: req.body.email,
    password: req.body.password,
  };
  const registeredUser = await registerUser(payload);
  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: registeredUser,
  });
}

export async function loginUserController(req, res) {
  const { email, password } = req.body;

  const session = await loginUser(email, password);

  setupCookie(res, session);

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
}

export const logoutController = async (req, res) => {
  const { sessionId } = req.cookies;

  if (typeof sessionId === 'string') {
    await logoutUser(sessionId);
  }

  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');
  res.status(204).end();
};

export const refreshTokensController = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;

  const session = await refreshTokens(sessionId, refreshToken);

  setupCookie(res, session);

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const patchUserController = async (req, res, next) => {
  const userId = req.user._id;

  const user = {
    email: req.body.email,
    name: req.body.name,
    gender: req.body.gender,
    weight: req.body.weight,
    sportTime: req.body.sportTime,
    dailyWater: req.body.dailyWater,
  };

  const patchedUser = await patchUser(userId, user);

  if (patchedUser === null) {
    next(createHttpError(404, 'User not found'));
    return;
  }

  console.log(patchedUser);

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a user!',
    data: patchedUser,
  });
};
