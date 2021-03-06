/* istanbul ignore file */
const request = require('supertest');
const app = require('../app');
const config= require('../config/index');
const fetch=require('node-fetch');
exports.post = function(url, body, header) {
  const httpRequest = request(app).post(url);
  httpRequest.send(body);
  httpRequest.set('Accept', 'application/json');
  if (header !== null && header !== undefined) {
    httpRequest.set('Authorization', `Bearer ${header}`);
  }
  return httpRequest;
};
exports.postFormData = function(url, body, header, data=null) {
  const httpRequest = request(app).post(url);
  httpRequest.attach('file', body);
  if (data) {
    for (const o of Object.keys(data)) {
      httpRequest.field(o, data[o]);
    }
  }
  if (header !== null && header !== undefined) {
    httpRequest.set('Authorization', `Bearer ${header}`);
  }
  httpRequest.set('Content-Type', 'application/x-www-form-urlencoded');
  return httpRequest;
};
exports.postFormDataMultiple = function(url, body, header, data=null) {
  const httpRequest = request(app).post(url);
  for (const b of body) {
    httpRequest.attach('file', b.my_file);
  }
  if (data) {
    for (const o of Object.keys(data)) {
      httpRequest.field(o, data[o]);
    }
  }

  if (header !== null && header !== undefined) {
    httpRequest.set('Authorization', `Bearer ${header}`);
  }
  httpRequest.set('Content-Type', 'application/x-www-form-urlencoded');
  return httpRequest;
};
exports.get = function(url, query, header) {
  const httpRequest = request(app).get(url);
  httpRequest.query(query);
  httpRequest.set('Accept', 'application/json');
  if (header !== null && header !== undefined) {
    httpRequest.set('Authorization', `Bearer ${header}`);
  }
  return httpRequest;
};
exports.getUsingKey = function(url, query, header) {
  const httpRequest = request(app).get(url);
  httpRequest.query(query);
  httpRequest.set('Accept', 'application/json');
  if (header !== null && header !== undefined) {
    httpRequest.set('x-access-key', `${header}`);
  }
  return httpRequest;
};
exports.fakeget = function(url, query, header) {
  const httpRequest = request(app).get(url);
  httpRequest.query(query);
  httpRequest.set('Accept', 'application/json');
  if (header !== null && header !== undefined) {
    httpRequest.set('Authorization', `${header}`);
  }
  return httpRequest;
};
exports.delete = function(url, body, header) {
  const httpRequest = request(app).delete(url);
  httpRequest.send(body);
  httpRequest.set('Accept', 'application/json');
  if (header !== null && header !== undefined) {
    httpRequest.set('Authorization', `Bearer ${header}`);
  }
  return httpRequest;
};
exports.put = function(url, body, header) {
  const httpRequest = request(app).put(url);
  httpRequest.send(body);
  httpRequest.set('Accept', 'application/json');
  if (header !== null && header !== undefined) {
    httpRequest.set('Authorization', `Bearer ${header}`);
  }
  return httpRequest;
};
exports.putUsingKey = function(url, body, header) {
  const httpRequest = request(app).put(url);
  httpRequest.send(body);
  httpRequest.set('Accept', 'application/json');
  if (header !== null && header !== undefined) {
    httpRequest.set('x-access-key', `${header}`);
  }
  return httpRequest;
};
