/* eslint-disable max-len */
/* istanbul ignore file */
require('dotenv').config();
const request = require('request-promise');
const mailjet = require('node-mailjet')
  .connect(process.env.SMTP_USERNAME, process.env.SMTP_PASSWORD);
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const crypto=require('crypto');
const ObjectID = mongoose.Types.ObjectId;
const Minio = require('minio');
const jest= require('jest');
const minioClient = new Minio.Client({
  endPoint: process.env.MINO_BASE_URL,
  port: 9000,
  useSSL: true,
  accessKey: process.env.MINO_KEY,
  secretKey: process.env.MINO_SECRET
});
jest.mock(minioClient);
const file = './temp.pdf';
const metaData = {
  'Content-Type': 'application/pdf',
};

// eslint-disable-next-line max-len

// minioClient.bucketExists(process.env.MINO_BUCKET_NAME);
// minioClient.makeBucket(process.env.MINO_BUCKET_NAME);
/**
 * Get file url
 *
 * @param   {String}  file  [file description]
 *
 * @return  {Promise<string>}        [return description]
 */
async function getFileUrl(file) {
  try {
    const fileUrl=await minioClient.presignedGetObject(process.env.MINO_BUCKET_NAME, file, 24*60*60*7);
    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}
/**
 * Function to upload file
 *
 * @return  {Promise<string>}  [return description]
 */
async function uploadFile() {
  try {
    const file = './temp.pdf';
    const metaData = {
      'Content-Type': 'application/pdf',
    };
    const etag=await minioClient.fPutObject(process.env.MINO_BUCKET_NAME, 'testfile', file, metaData);
    console.log(etag);
    return etag;
  } catch (error) {
    console.log(error);
  }
}

// uploadFile().then((res)=>{
//   console.log(res, 'etag');
// }).catch((error)=>{
//   console.log(error, 'error');
// });
describe('Test the upload api', () => {
  beforeAll(async () => {
    minioClient.bucketExists(process.env.MINO_BUCKET_NAME).mockResolvedValue(true);
    minioClient.makeBucket(process.env.MINO_BUCKET_NAME).mockResolvedValue(true);
    minioClient.fPutObject(process.env.MINO_BUCKET_NAME, 'testfile', file, metaData).mockResolvedValue('cc83c3f2fb5db6561ef4945f6eee031c');
    minioClient.presignedGetObject(process.env.MINO_BUCKET_NAME, 'testfile', 24*60*60*7).mockResolvedValue('https://play.min.io:9000/mailmerge/testfile?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=Q3AM3UQ867SPQQA43P2F%2F20210411%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20210411T103224Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=b5ce56056bb39752f52e655e98081d59e6535624e58cd2167d76fae22128ab6c');
  });
  test('upload ', async () => {
    const upload=uploadFile();
    console.log(upload);
    expect(upload).toBeTruthy();
  });
});
// getFileUrl('testfile').then((res)=>{
//   console.log(res, 'file url');
// }).catch((err)=>{
//   console.log(err, 'error');
// });
/**
 * script
 */
async function getDeliveryReport() {
  try {
    console.log('connecting to mailjet...');
    const request = mailjet.get('statcounters').request({
      SourceId: '5f76ded383ce345563ee4a7e',
      CounterSource: 'Campaign',
      CounterTiming: 'Message',
      CounterResolution: 'Lifetime',
    });
    console.log('fetching response from mailjet...');
    const response=await request;
    console.log(response.body, 'body');
    return response;
  } catch (error) {
    console.log(error);
  }
}

/**
 * test
 *
 * @return  {[type]}  [return description]
 */
async function getDeliveryReportTwo() {
  try {
    const options = {
      method: 'GET',
      uri: `https://api.mailjet.com/v3/REST/statcounters`,
      qs: {
        SourceId: '5f72c4f65f0c82b72a91f739',
        CounterSource: 'Campaign',
        CounterTiming: 'Message',
        CounterResolution: 'Lifetime'},
      headers: {
        Authorization: 'Basic ' + Buffer.from(process.env.SMTP_USERNAME + ':' + process.env.SMTP_PASSWORD).toString('base64')
      },
      json: true // Automatically stringifies the body to JSON
    };
    const response = await request(options);
    console.log(response, 'body');
    return response;
  } catch (error) {
    console.log(error);
  }
}
// getDeliveryReportTwo().then((res)=>{
//   console.log(res, 'res');
// }).catch((err)=>{
//   console.log(err, 'error');
// });
async function deleteDocument() {
  try {
    console.log('connecting to db..');
    const connection = await mongoose.createConnection('mongodb+srv://kenykore:boluwatife@cluster0-5qrlk.mongodb.net/nibbsdev?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
    console.log('connected to db,Instating model..');
    const DB = await connection.db;
    const Document = DB.collection('documents');
    const doc=await Document.updateMany({}, {
      $set: {'signatories.$.page': 0}
    }, {new: true});

    await connection.close();
    return;
  } catch (error) {
    console.log(error);
  }
}
// console.log(crypto.randomBytes(7).toString('hex').toUpperCase());
// cc83c3f2fb5db6561ef4945f6eee031c minio response
