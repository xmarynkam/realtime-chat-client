import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const Api = headers => {
  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const projectAxios = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
    headers: (() => {
      return {
        ...defaultHeaders,
        ...headers,
      };
    })(),
  });

  projectAxios.interceptors.response.use(
    config => {
      return config;
    },
    error => {
      console.error('API Error:', error);

      return Promise.reject(error);
    },
  );

  return projectAxios;
};

export const ApiWithToken = () => {
  const token = localStorage.getItem('auth_token');

  return axios.create({
    baseURL: apiUrl,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};
