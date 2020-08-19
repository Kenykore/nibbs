'use strict';
require("dotenv").config();
const fetch = require("node-fetch");
const moment = require("moment");
const config = require("./../config/index");
const crypto = require("crypto");
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
  
}

module.exports = UtilityFunction;