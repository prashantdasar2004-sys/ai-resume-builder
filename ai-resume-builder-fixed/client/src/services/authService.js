import API from './api.js';

const register = async (name, email, password) => {
  return await API.post('/auth/register', { name, email, password });
};

const emailLogin = async (email, password) => {
  return await API.post('/auth/login', { email, password });
};

const googleLogin = async (credential) => {
  return await API.post('/auth/google', { credential });
};

const getMe = async () => {
  return await API.get('/auth/me');
};

const logout = async () => {
  await API.post('/auth/logout');
};

export { register, emailLogin, googleLogin, getMe, logout };