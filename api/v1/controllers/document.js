const mongoose = require('mongoose');
const objectId= require('mongoose').Types.ObjectId;
const moment=require('moment');
const config = require('../../../config/index');
const fs = require('fs');
const base64Convert=require('base64-arraybuffer');
const status = require('http-status');
const request = require('request-promise');
const response = require('../../../utilities/response');
const User=require('../../../models/user');

const Document=require('../../../models/document');
const DocumentLog=require('../../../models/document_log');
const fetch = require('node-fetch');
const Invite=require('../../../models/invite');
const cloudinary = require('cloudinary').v2;
const Tokenizer = require('../../../utilities/tokeniztion');
const sendEmail = require('../../../services/Notification');
const validateSignDocument = require('../../../validations/validate_document_sign');
const validatePrepareDocument = require('../../../validations/validate_document_prepare');
const PDFDocument= require('pdf-lib').PDFDocument;
const Standard=require('pdf-lib').StandardFonts;
const rgb =require('pdf-lib').rgb;
const {randomNumber, formatPhoneNumber, addLeadingZeros, uploadFileMino, getFileUrl} = require('../../../utilities/utils');
const SendEmail = require('../../../services/Notification');
/**
 * Document class
 */
class DocumentController {
  static async prepareDocument(req, res, next) {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return response.sendError({res, message: 'No Document file was uploaded'});
      }
      const user=req.userDetails;

      /* istanbul ignore next */
      if (typeof req.body.recipients ==='string') {
        req.body.recipients=JSON.parse(req.body.recipients);
      }
      /* istanbul ignore next */
      if (typeof req.body.signatories ==='string') {
        req.body.signatories=JSON.parse(req.body.signatories);
      }
      /* istanbul ignore next */
      if (typeof req.body.documentProperty ==='string') {
        req.body.documentProperty=JSON.parse(req.body.documentProperty);
      }
      const {error} = validatePrepareDocument({...req.body});
      if (error) {
        return response.sendError({
          res,
          message: error.details[0].message
        });
      }
      const files=await processFiles(req, user);
      const documentPrepared= await Document.create({...req.body, file: files[0].path, publicId: files[0].publicId, ownerId: user.userId});
      // send to all signatories
      if (documentPrepared) {
        await sendDocuments(req.body.signatories, documentPrepared);
        await DocumentLog.create({
          log: `${user.name} prepared document for signing`,
          ownerId: user.userId,
          documentId: documentPrepared._id
        });
        return response.sendSuccess({res, message: 'Document Prepared for Signing Successfully', body: {data: documentPrepared}});
      }
      /* istanbul ignore next */
      return response.sendError({
        res,
        message: 'Unable to prepare document for signing'
      });
    } catch (error) {
      /* istanbul ignore next */
      /* istanbul ignore next */
      return next(error);
    }
  }
  static async signDocument(req, res, next) {
    try {
      const user=req.userDetails;

      const files=req.files?await saveSignature(req, user):[];
      if (files.length===0 && req.files) {
        return response.sendError({res, message: 'Could not upload signature'});
      }
      if (files.length>0) {
        req.body.signature=files[0];
        await User.findByIdAndUpdate(user.userId, {
          $push: {signatures: files[0]}
        });
      }

      const {error} = validateSignDocument({...req.body});
      if (error) {
        return response.sendError({
          res,
          message: error.details[0].message
        });
      }
      const documentToSign= await Document.findById(req.body.documentId).lean();
      const signatories=documentToSign.signatories;
      const signatureFound=signatories.find((x)=>{
        return (x.email===user.email);
      });
      /* istanbul ignore next */
      if (!signatureFound) {
        return response.sendError({
          res,
          message: 'You are not signatory to this document'
        });
      }
      const signatureSignedFound=signatories.find((x)=>{
        return x.email===user.email && x.signed===true;
      });
      if (signatureSignedFound) {
        return response.sendError({
          res,
          message: 'You are have already signed this document'
        });
      }
      const filePart=documentToSign.file.split('?');
      const fileTypeArray=filePart[0].split('.');
      const imgFile=['jpg', 'png', 'jpeg', 'svg'];

      const fileType=fileTypeArray[fileTypeArray.length-1];
      if (!imgFile.includes(fileType)) {
        return await processDocument(res, req, documentToSign, user, signatureFound);
      } else {
        return await processImageDocument(res, req, documentToSign, user, signatureFound, fileType);
      }
    } catch (error) {
      /* istanbul ignore next */
      /* istanbul ignore next */
      return next(error);
    }
  }
  static async fetchAllDocument(req, res, next) {
    try {
      const documentsPerPage = parseInt(req.query.limit) || 10;
      const currentPage = parseInt(req.query.page) || 1;
      delete req.query.page;
      delete req.query.limit;
      const skip = (currentPage-1) * documentsPerPage;
      const totaldocuments = await Document.find({...req.query,
        $or: [{
          ownerId: req.userDetails.userId
        }, {
          'signatories.email': req.userDetails.email
        }]}).countDocuments();
      const signedDocument=await Document.countDocuments({signed: true, $or: [{
        ownerId: req.userDetails.userId
      }, {
        'signatories.email': req.userDetails.email
      }]});
      const pendingDocument=await Document.countDocuments({signed: false, $or: [{
        ownerId: req.userDetails.userId
      }, {
        'signatories.email': req.userDetails.email
      }]});
      const archivedDocument=await Document.countDocuments({deleted: true, $or: [{
        ownerId: req.userDetails.userId
      }, {
        'signatories.email': req.userDetails.email
      }]});
      const documents = await Document.find({...req.query, $or: [{
        ownerId: req.userDetails.userId
      }, {
        'signatories.email': req.userDetails.email
      }]}).sort({_id: 'desc'}).skip(skip).limit(documentsPerPage);
      const totalPages = Math.ceil(totaldocuments / documentsPerPage);

      if (documents && documents.length) {
        const responseContent = {
          'total_documents': totaldocuments,
          'document_stats': {
            'signed_document': signedDocument,
            'archived_document': archivedDocument,
            'pending_document': pendingDocument
          },
          'pagination': {
            'current': currentPage,
            'number_of_pages': totalPages,
            'perPage': documentsPerPage,
            'next': currentPage === totalPages ? currentPage : currentPage + 1
          },
          'data': documents
        };
        return response.sendSuccess({res, message: 'Documents  found', body: responseContent});
      }
      /* istanbul ignore next */
      return response.sendError({res, message: 'No Document found', statusCode: status.NOT_FOUND});
    } catch (error) {
      /* istanbul ignore next */
      /* istanbul ignore next */
      return next(error);
    }
  }
  static async fetchSpecificDocument(req, res, next) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.documentId)) {
        return response.sendError({res, message: 'Invalid Document id'});
      }

      const document=await Document.findById(req.params.documentId).lean();
      if (document) {
        return response.sendSuccess({
          res,
          message: 'Document found',
          body: {document: document, logs: await DocumentLog.find({documentId: document._id})}
        });
      }
      /* istanbul ignore next */
      return response.sendError({
        res,
        message: 'Unable to find documents,try again'
      });
    } catch (error) {
      /* istanbul ignore next */
      return next(error);
    }
  }
  /**
   * fetch document file using doccument file name
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   * @return {Object}
   */
  static async fetchDocument(req, res, next) {
    try {
      const doc=await getFileUrl(req.query.documentId);
      return response.sendSuccess({res, message: 'File found', body: {
        file: doc
      }});
    } catch (error) {
      return next(error);
    }
  }
}
/**
 * Process pdf for image type doc file
 *@param {Object} res
 * @param   {Object}  req             [req description]
 * @param   {Object}  documentToSign  [documentToSign description]
 * @param   {Object}  user            [user description]
 *@param {any} signatureFound
 @param {any} fileType
 * @return  {Promise<any>}                  [return description]
 */
async function processImageDocument(res, req, documentToSign, user, signatureFound, fileType) {
  try {
    const pdfDoc = await PDFDocument.create();
    const signError='Unable to sign document';
    const signatureImage = await fetch(req.body.signature);
    const signatureTypeArray=req.body.signature.split('.');
    const signatureType=signatureTypeArray[signatureTypeArray.length-1];
    const pdfImage=await fetch(documentToSign.file);
    const signatureImageBytes=await signatureImage.buffer();
    const pdfImageBuffer=await pdfImage.buffer();
    const pdfImageEmbed = fileType==='jpeg'?await pdfDoc.embedJpg(pdfImageBuffer): await pdfDoc.embedPng(pdfImageBuffer);
    const pngImage =signatureType==='jpg'?await pdfDoc.embedJpg(signatureImageBytes): await pdfDoc.embedPng(signatureImageBytes);
    const pngDims = pngImage.scale(0.5);
    const page = pdfDoc.addPage([pdfImageEmbed.width, pdfImageEmbed.height]);
    page.drawImage(pdfImageEmbed, {
      x: 0,
      y: 0,
      width: page.getWidth(),
      height: page.getHeight(),
    });
    for (const s of signatureFound) {
      page.drawImage(pngImage, {
        x: s.x_coordinate,
        y: Number(page.getHeight()-s.y_coordinate-pngDims.height-10),
        width: 50,
        height: 50,
      });
    }
    const pdfBytes = await pdfDoc.save();
    const id='tempdoc.pdf';
    const fileSaved=await saveFile(pdfBytes, id);
    const file=await uploadSignedDoc(id, documentToSign.publicId);
    /* istanbul ignore next */
    if (!file) {
      return response.sendError({
        res,
        message: signError
      });
    }
    const documentUpdated= await Document.findOneAndUpdate({'_id': objectId(req.body.documentId), 'signatories.email': user.email}, {
      'signatories.$.signature': req.body.signature,
      'signatories.$.signed': true,
      'file': file.path
    }, {new: true}).lean();
    if (documentUpdated) {
      await DocumentLog.create({
        log: `${user.name} signed document`,
        ownerId: user.userId,
        documentId: documentUpdated._id
      });
      if (checkSignatureAllSigned(documentUpdated.signatories)) {
        await Document.findByIdAndUpdate(req.body.documentId, {signed: true});
        await sendDocumentToRecipients(documentUpdated);
      }
      return response.sendSuccess({res, message: 'Document Signed Successfully', body: {data: documentUpdated}});
    }
    /* istanbul ignore next */
    return response.sendError({
      res,
      message: signError
    });
  } catch (error) {
    /* istanbul ignore next */
    /* istanbul ignore next */
    return false;
  }
}
/**
 * [async description]
 *@param {Object} res
 * @param   {Object}  req             [req description]
 * @param   {Object}  documentToSign  [documentToSign description]
 * @param   {Object}  user          [user description]
 *@param {any} signatureFound
 * @return  {Promise<any>}                  [return description]
 */
async function processDocument(res, req, documentToSign, user, signatureFound) {
  try {
    const signError='Unable to sign document';
    // change to minio
    const existingPdf =await fetch(documentToSign.file);
    const signatureImage = await fetch(req.body.signature);
    const signatureTypeArray=req.body.signature.split('.');
    const signatureType=signatureTypeArray[signatureTypeArray.length-1];
    const existingPdfBytes=await existingPdf.buffer();
    const signatureImageBytes=await signatureImage.buffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pngImage = signatureType==='jpg'?await pdfDoc.embedJpg(signatureImageBytes): await pdfDoc.embedPng(signatureImageBytes);
    const pngDims = pngImage.scale(0.5);
    // Add a blank page to the document

    for (const s of signatureFound.coordinates) {
      const page = pdfDoc.getPage(Number(s.page) || 0);
      page.drawImage(pngImage, {
        x: s.x_coordinate,
        y: Number(page.getHeight()-s.y_coordinate-pngDims.height-10),
        width: 50,
        height: 50,
      });
    }

    const pdfBytes = await pdfDoc.save();
    const id='temp.pdf';
    const fileSaved=await saveFile(pdfBytes, id);
    const file=await uploadSignedDoc(id, documentToSign.publicId );
    /* istanbul ignore next */
    if (!file) {
      return response.sendError({
        res,
        message: signError
      });
    }
    let documentUpdated= await Document.findOneAndUpdate({'_id': objectId(req.body.documentId), 'signatories.email': user.email}, {
      'signatories.$.signature': req.body.signature,
      'signatories.$.signed': true,
      'file': file.path
    }, {new: true});
    if (documentUpdated) {
      await DocumentLog.create({
        log: `${user.name} signed document`,
        ownerId: user.userId,
        documentId: documentUpdated._id
      });
      if (checkSignatureAllSigned(documentUpdated.signatories)) {
        documentUpdated= await Document.findByIdAndUpdate(req.body.documentId, {signed: true}, {new: true}).lean();
        await sendDocumentToRecipients(documentUpdated);
      }
      return response.sendSuccess({res, message: 'Document Signed Successfully', body: {data: documentUpdated}});
    }
    /* istanbul ignore next */
    return response.sendError({
      res,
      message: signError
    });
  } catch (error) {
    /* istanbul ignore next */
    console.log(error);
    /* istanbul ignore next */
    return false;
  }
}
/**
 * [async description]
 * [req description]
 * @param   {Object}  documentToSign  [documentToSign description]
 * @param   {Object}  name        [name initials]
 *@param {any} property property of
 @param {any} dateProperty property of
date stamo
 * @return  {Promise<any>}                  [return description]
 */
async function processDocumentInitials( documentToSign, name, property, dateProperty=null) {
  try {
    // change to minio
    const existingPdf =await fetch(documentToSign);
    const existingPdfBytes=await existingPdf.buffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    // Add a blank page to the document
    const page = pdfDoc.getPage(Number(property.page) || 0);
    const timesRomanFont = await pdfDoc.embedFont(Standard.TimesRoman);
    page.setFont(timesRomanFont);
    console.log(name);
    page.drawText(name, {
      x: property.x_coordinate,
      y: property.y_coordinate,
      font: timesRomanFont,
      size: 24,
      color: rgb(1, 0, 0),
      lineHeight: 24,
      opacity: 0.75,
    });
    if (dateProperty) {
      page.drawText(moment(Date.now()).format('DD/MM/YYYY HH:mm'), {
        x: dateProperty.x_coordinate,
        y: dateProperty.y_coordinate,
        size: 12,
      });
    }
    const pdfBytes = await pdfDoc.save();
    const id='tempinit.pdf';
    const fileSaved=await saveFile(pdfBytes, id);
    const file=await uploadSignedDoc(id, name );
    /* istanbul ignore next */
    if (!file) {
      return false;
    }
    return file.path;
  } catch (error) {
    /* istanbul ignore next */
    console.log(error);
    /* istanbul ignore next */
    return false;
  }
}
/**
 * Process file upload
 *@param {Object} req object
 @param {Object} user
 * @return  {Promise<Array>}  return file array
 */
async function processFiles(req, user) {
  try {
    const files=[];
    for (const f of Object.keys(req.files)) {
      const allFiles=req.files[f];
      if (Array.isArray(allFiles)) {
        /* istanbul ignore next */
        for (const ff of allFiles) {
          /* istanbul ignore next */
          const fileUploaded=await uploadFile(ff, user.email);
          if (!fileUploaded) {
            /* istanbul ignore next */
            continue;
          }
          /* istanbul ignore next */
          files.push({path: fileUploaded.path, publicId: fileUploaded.publicId});
        }
      }
      const file=await uploadFile(allFiles, user.email);
      if (!file) {
        continue;
      }
      files.push({path: file.path, publicId: file.publicId});
    }
    return files;
  } catch (error) {
    /* istanbul ignore next */
    console.log(error);
    /* istanbul ignore next */
    return [];
  }
}
/**
 * Save signature in cloud
 *
 * @param   {Object}  req  [req description]
 * @param {Object} user
 *
 * @return  {Promise<Array>}       [return description]
 */
async function saveSignature(req, user) {
  try {
    const files=[];
    for (const f of Object.keys(req.files)) {
      const allFiles=req.files[f];

      const file=await uploadSignature(allFiles, user.email);
      /* istanbul ignore next */
      if (!file) {
        continue;
      }
      files.push(file.path);
    }
    return files;
  } catch (error) {
    /* istanbul ignore next */
    console.log(error);
    /* istanbul ignore next */
    return [];
  }
}
/**
 * Send document to recipients
 *
 * @param   {Object}  documentUpdated  [documentUpdated description]
 *
 * @return  {Promise<Boolean>}                   [return description]
 */
async function sendDocumentToRecipients(documentUpdated) {
  try {
    const filename=`${documentUpdated.documentTitle}.pdf`;
    const docInitials=documentUpdated.documentProperty? documentUpdated.documentProperty.find((x)=>{
      return (x.name==='initials');
    }) : null;
    const docDateStamp=documentUpdated.documentProperty? documentUpdated.documentProperty.find((x)=>{
      return (x.name==='dateStamp');
    }) : null;
    for (const s of documentUpdated.recipients) {
      let docUrl=documentUpdated.file;
      if (docInitials) {
        const fileurl =await processDocumentInitials(docUrl, s.name, docInitials, docDateStamp);
        docUrl=fileurl?fileurl:docUrl;
      }
      await sendEmail({
        to: s.email,
        from: 'e-signaturenotification@nibss-plc.com.ng',
        subject: 'Document Signed on Mail Merge NIBSS',
        template_name: 'document-signed',
        data: {
          name: s.name,
          title: documentUpdated.documentTitle,
          body: documentUpdated.documentBody,
          campaignId: documentUpdated._id,
          url: docUrl
        },
        attachment: [{
          filename: filename,
          path: docUrl
        }]
      });
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
/**
 * Send document to signatories
 *
 * @param   {Array}  signatories  [signatories description]
 * @param {Object} documentPrepared document prepared
 *
 * @return  {Promise<Boolean>}               [return description]
 */
async function sendDocuments(signatories, documentPrepared) {
  try {
    for (const s of signatories) {
      const userFound=await User.findOne({email: s.email}).lean();
      const accessToken = Tokenizer.signToken({
        ...userFound,
        userId: userFound._id || undefined,
        verified: true
      });
      const url=`${process.env.BASE_URL}/append-document-open/${documentPrepared._id}/${accessToken}`;
      await sendEmail({
        to: s.email,
        from: 'e-signaturenotification@nibss-plc.com.ng',
        subject: 'Signature Required on Mail Merge NIBSS',
        template_name: 'signature-required',
        data: {
          name: s.name,
          title: documentPrepared.documentTitle,
          url: url
        }
      });
    }
    return true;
  } catch (error) {
    /* istanbul ignore next */
    console.log(error);
    /* istanbul ignore next */
    return false;
  }
}
/**
 * Function to upload files and store on server
 *
 * @param   {File}  f  file objct
 * @param   {String}  userId  user id
 *
 * @return  {Promise<Boolean | Object>}
 */
async function uploadFile(f, userId) {
  try {
    const publicId = `document_${userId}_${f.name}`;
    const fileFormat=f.mimetype.split('/')[1];
    await uploadFileMino(publicId, f.tempFilePath, fileFormat);
    const fileUploaded=await getFileUrl(publicId);
    return {file: f, path: fileUploaded, name: f.name, publicId: publicId};
    /* istanbul ignore next */
  } catch (error) {
    /* istanbul ignore next */
    console.log(error);
    /* istanbul ignore next */
    return false;
  }
}
/**
 * Method to upload signature
 * @param   {File}  f  file objct
 * @param   {String}  userId  user id
 *
 * @return  {Promise<Boolean | Object>}
 */
async function uploadSignature(f, userId) {
  try {
    const publicId = `signatures_${userId}_${f.name}`;
    await uploadFileMino(publicId, f.tempFilePath, f.mimetype);
    const fileUploaded=await getFileUrl(publicId);
    return {file: f, path: fileUploaded};
    /* istanbul ignore next */
  } catch (error) {
    /* istanbul ignore next */
    console.log(error);
    /* istanbul ignore next */
    return false;
  }
}
/**
 * Function to upload signed files and store on server
 *
 * @param   {Buffer}  f  file object
 * @param {String} publicId cloudinary public id of uploaded document
 *
 * @return  {Promise<Boolean | Object>}
 */
async function uploadSignedDoc(f, publicId) {
  try {
    const fileDidUpload= await uploadFileMino(publicId, f, 'application/pdf');
    /* istanbul ignore next */

    if (!fileDidUpload) {
      return false;
    }
    const fileUploaded=await getFileUrl(publicId);
    return {path: fileUploaded};
    /* istanbul ignore next */
  } catch (error) {
    /* istanbul ignore next */
    console.log(error);
    /* istanbul ignore next */
    return false;
  }
}
/**
 * Function for checking if document is signed
 *
 * @param   {Array}  data  [data description]
 *
 * @return  {Boolean}        [return description]
 */
function checkSignatureAllSigned(data) {
  let count=0;
  for (const d of data) {
    if (d.signed) {
      count++;
    }
  }
  return count===data.length?true:false;
}
/* istanbul ignore next */
/**
 * Function to save file locally
 *
 * @param   {ArrayBuffer}  data  [data description]
 * @param   {String}  id    [id description]
 *
 * @return  {Promise<Object>}        [return description]
 */
function saveFile(data, id) {
  return new Promise((resolve)=>{
    fs.writeFile(`${id}`, data, (err, f)=>{
      if (err) {
        /* istanbul ignore next */
        console.log(err);
        resolve(false);
      }
      resolve(f);
    });
  });
}
module.exports=DocumentController;
