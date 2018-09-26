import 'whatwg-fetch';

const defaultOptions = {
  credentials: 'same-origin',
};

const headers = {
  'Content-Type': 'application/json',
};

const defaultError = { message: 'Something went wrong.' };

const checkStatus = res => {
  if (!res.ok) {
    return res
      .json()
      .then(body => {
        const error = new Error(res.statusText);
        error.response = res;
        error.body = body;
        throw error;
      })
      .catch(error => {
        /* eslint-disable no-param-reassign */
        error.status = res.status;
        error.response = res;
        error.body = error.body || { ...defaultError };
        throw error;
      });
  }
  return res;
};

export const parseJSON = res => (res.json ? res.json() : {});

const errorCheck = error => {
  error.body = error.body || { ...defaultError };
  if (error.message === 'Failed to fetch') {
    error.body.message = 'Unable to reach server, try refreshing browser.';
    error.body.type = 'error';
    error.body.source = 'Browser';
  }
  throw error;
};

// functions that return data
export const get = path =>
  fetch(path, defaultOptions)
    .then(checkStatus)
    .then(parseJSON)
    .catch(errorCheck);
export const post = (path, body) =>
  fetch(path, {
    ...defaultOptions,
    method: 'post',
    headers,
    body: JSON.stringify(body),
  })
    .then(checkStatus)
    .then(parseJSON)
    .catch(errorCheck);

export const put = (path, body) =>
  fetch(path, {
    ...defaultOptions,
    method: 'put',
    headers,
    body: JSON.stringify(body),
  })
    .then(checkStatus)
    .catch(errorCheck);
export const del = (path, body) =>
  fetch(path, {
    ...defaultOptions,
    method: 'delete',
    body: body && JSON.stringify(body),
  })
    .then(checkStatus)
    .catch(errorCheck);

// some aliases for name conflicts with redux-saga
export const update = put;
export const create = post;
export const destroy = del;
