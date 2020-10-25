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
exports.postFormData = function(url, body, header) {
  const httpRequest = request(app).post(url);
  httpRequest.attach('file', body);
  if (header !== null && header !== undefined) {
    httpRequest.set('Authorization', `Bearer ${header}`);
  }
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
