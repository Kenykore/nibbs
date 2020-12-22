/* istanbul ignore file */
'use strict';
require('dotenv').config();
const fetch = require('node-fetch');
const moment = require('moment');
const config = require('./../config/index');
const crypto = require('crypto');
const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINO_BASE_URL,
  port: 9000,
  useSSL: true,
  accessKey: process.env.MINO_KEY,
  secretKey: process.env.MINO_SECRET
});
/** General utility functions used across the project */
const UtilityFunction = {
  /**
     * Helper function to string pad - add 00000 to the beginning of a number
     * @param   {number}  number  number to left pad - 000001
     * @return  {string}       padded string
     */
  addLeadingZeros(number) {
    return ('00000' + number).slice(-5);
  },
  /**
 * generates a random string
 * @param   {number}  length  [length of string to be generated]
 * @return  {string}          [generated random string]
 */
  randomNumber(length) {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
  },
  /**
 * Get file url
 *
 * @param   {String}  file  [file description]
 *
 * @return  {Promise<string>}        [return description]
 */
  async getFileUrl(file) {
    try {
      const fileUrl=await minioClient.presignedGetObject(process.env.MINO_BUCKET_NAME, file, 24*60*60*365000);
      return fileUrl;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  /**
 * Function to upload file
 * @param {string} name
 *@param {string} path
 @param {string} contentType
 * @return  {Promise<string>}  [return description]
 */
  async uploadFileMino(name, path, contentType) {
    try {
      const metaData =contentType? {
        'Content-Type': contentType,
      }:{

      };
      const etag=await minioClient.fPutObject(process.env.MINO_BUCKET_NAME, name, path, metaData);
      console.log(etag);
      return etag;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
};

module.exports = UtilityFunction;
