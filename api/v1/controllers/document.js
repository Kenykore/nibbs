const mongoose = require('mongoose');
const objectId= require('mongoose').Types.ObjectId;
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
const {randomNumber, formatPhoneNumber, addLeadingZeros} = require('../../../utilities/utils');
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
      console.log(req.files, 'files to upload');
      const user=req.userDetails;
      const files=[];
      console.log(req.body, 'body');
      if (typeof req.body.recipients ==='string') {
        req.body.recipients=JSON.parse(req.body.recipients);
      }
      if (typeof req.body.signatories ==='string') {
        req.body.signatories=JSON.parse(req.body.signatories);
      }
      console.log(req.body, 'body');
      const {error} = validatePrepareDocument({...req.body});
      if (error) {
        return response.sendError({
          res,
          message: error.details[0].message
        });
      }
      for (const f of Object.keys(req.files)) {
        const allFiles=req.files[f];
        console.log(allFiles, 'file');
        if (Array.isArray(allFiles)) {
          for (const ff of allFiles) {
            const fileUploaded=await uploadFile(ff, user.email);
            console.log(fileUploaded, 'file uploaded');
            if (!fileUploaded) {
              continue;
            }
            files.push({path: fileUploaded.path, publicId: fileUploaded.publicId});
          }
        }
        const file=await uploadFile(allFiles, user.email);
        console.log(file, 'file uploaded');
        if (!file) {
          continue;
        }
        files.push({path: file.path, publicId: file.publicId});
      }
      const documentPrepared= await Document.create({...req.body, file: files[0].path, publicId: files[0].publicId, ownerId: user.userId});
      // send to all signatories
      if (documentPrepared) {
        for (const s of req.body.signatories) {
          const userFound=await User.findOne({email: s.email}).lean();
          const accessToken = Tokenizer.signToken({
            ...userFound,
            userId: userFound._id || undefined,
            verified: true
          });
          console.log(process.env.BASE_URL, 'base url');
          await sendEmail({
            to: s.email,
            from: 'e-signaturenotification@nibss-plc.com.ng',
            subject: 'Signature Required on Mail Merge NIBSS',
            template_name: 'signature-required',
            data: {
              name: s.name,
              title: documentPrepared.documentTitle,
              url: `${process.env.BASE_URL}/append-document-open/${documentPrepared._id}/${accessToken}`
            }
          });
        }
        await DocumentLog.create({
          log: `${user.name} prepared document for signing`,
          ownerId: user.userId,
          documentId: documentPrepared._id
        });
        return response.sendSuccess({res, message: 'Document Prepared for Signing Successfully', body: {data: documentPrepared}});
      }
      return response.sendError({
        res,
        message: 'Unable to prepare document for signing'
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async signDocument(req, res, next) {
    try {
      const user=req.userDetails;
      if (req.files && Object.keys(req.files).length > 0) {
        const files=[];
        for (const f of Object.keys(req.files)) {
          const allFiles=req.files[f];

          console.log(allFiles, 'file');
          if (Array.isArray(allFiles)) {
            for (const ff of allFiles) {
              const signatureUploaded=await uploadSignature(ff, user.email);
              if (!signatureUploaded) {
                continue;
              }
              files.push(signatureUploaded.path);
            }
          }
          const file=await uploadSignature(allFiles, user.email);
          console.log(file, 'file uploaded');
          if (!file) {
            continue;
          }
          files.push(file.path);
        }
        if (files.length===0) {
          return response.sendError({res, message: 'Could not upload signature'});
        }
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
      console.log(user.email);
      const documentToSign= await Document.findById(req.body.documentId).lean();
      const signatories=documentToSign.signatories;
      const signatureFound=signatories.find((x)=>{
        return (x.email===user.email);
      });
      console.log(signatureFound, 'signature');
      if (!signatureFound) {
        return response.sendError({
          res,
          message: 'You are not signatory to this document'
        });
      }
      const signatureSignedFound=signatories.find((x)=>{
        return x.email===user.email && x.signed===true;
      });
      console.log(signatureSignedFound);
      if (signatureSignedFound) {
        return response.sendError({
          res,
          message: 'You are have already signed this document'
        });
      }
      const fileTypeArray=documentToSign.file.split('.');
      console.log(fileTypeArray, 'file type');
      const imgFile=['jpg', 'png', 'jpeg', 'svg'];
      const fileType=fileTypeArray[fileTypeArray.length-1];
      console.log(fileType, 'file type');
      console.log(signatureFound, 'signature found');
      if (!imgFile.includes(fileType)) {
        const existingPdf =await fetch(documentToSign.file);
        const signatureImage = await fetch(req.body.signature);
        const signatureTypeArray=req.body.signature.split('.');
        const signatureType=signatureTypeArray[signatureTypeArray.length-1];
        const existingPdfBytes=await existingPdf.buffer();
        const signatureImageBytes=await signatureImage.buffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        console.log(pdfDoc, 'pdf');
        const pngImage = signatureType==='jpg'?await pdfDoc.embedJpg(signatureImageBytes): await pdfDoc.embedPng(signatureImageBytes);
        const pngDims = pngImage.scale(0.5);
        // Add a blank page to the document
        const page = pdfDoc.getPage(Number(signatureFound.page) || 0);
        page.drawImage(pngImage, {
          x: signatureFound.x_coordinate,
          y: Number(page.getHeight()-signatureFound.y_coordinate-pngDims.height-10),
          width: 50,
          height: 50,
        });
        const pdfBytes = await pdfDoc.save();
        console.log('uploading file');
        const id='temp.pdf';
        const fileSaved=await saveFile(pdfBytes, id);
        console.log(fileSaved, 'file saved');
        const file=await uploadSignedDoc(id, documentToSign.publicId);
        console.log(file, 'file upload response');
        if (!file) {
          return response.sendError({
            res,
            message: 'Unable to sign document'
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
            console.log('ready to send doc');
            documentUpdated= await Document.findByIdAndUpdate(req.body.documentId, {signed: true}, {new: true}).lean();
            for (const s of documentUpdated.recipients) {
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
                  url: documentUpdated.file
                },
                attachment: [{
                  filename: `${documentUpdated.documentTitle}.pdf`,
                  path: documentUpdated.file
                }]
              });
            }
          }
          console.log('done');
          return response.sendSuccess({res, message: 'Document Signed Successfully', body: {data: documentUpdated}});
        }
        return response.sendError({
          res,
          message: 'Unable to sign document'
        });
      } else {
        const pdfDoc = await PDFDocument.create();

        const signatureImage = await fetch(req.body.signature);
        const signatureTypeArray=req.body.signature.split('.');
        const signatureType=signatureTypeArray[signatureTypeArray.length-1];
        const pdfImage=await fetch(documentToSign.file);
        const signatureImageBytes=await signatureImage.buffer();
        const pdfImageBuffer=await pdfImage.buffer();
        const pdfImageEmbed = fileType==='jpg'?await pdfDoc.embedJpg(pdfImageBuffer): await pdfDoc.embedPng(pdfImageBuffer);
        const pngImage =signatureType==='jpg'?await pdfDoc.embedJpg(signatureImageBytes): await pdfDoc.embedPng(signatureImageBytes);
        const pngDims = pngImage.scale(0.5);
        const page = pdfDoc.addPage([pdfImageEmbed.width, pdfImageEmbed.height]);
        page.drawImage(pdfImageEmbed, {
          x: 0,
          y: 0,
          width: page.getWidth(),
          height: page.getHeight(),
        });
        page.drawImage(pngImage, {
          x: signatureFound.x_coordinate,
          y: Number(page.getHeight()-signatureFound.y_coordinate-pngDims.height-10),
          width: 50,
          height: 50,
        });
        const pdfBytes = await pdfDoc.save();
        console.log('uploading file');
        const id='tempdoc.pdf';
        const fileSaved=await saveFile(pdfBytes, id);
        console.log(fileSaved, 'file saved');
        const file=await uploadSignedDoc(id, documentToSign.publicId);
        console.log(file, 'file upload response');
        if (!file) {
          return response.sendError({
            res,
            message: 'Unable to sign document'
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
            console.log('ready to send doc');
            await Document.findByIdAndUpdate(req.body.documentId, {signed: true});
            for (const s of documentUpdated.recipients) {
              await sendEmail({
                to: s.email,
                from: 'e-signaturenotification@nibss-plc.com.ng',
                subject: 'Document Signed on Mail Merge NIBSS',
                template_name: 'document-signed',
                data: {
                  name: s.name,
                  title: documentUpdated.documentTitle,
                  body: documentUpdated.documentBody,
                  url: documentUpdated.file,
                  campaignId: documentUpdated._id
                },
                attachment: [{
                  filename: `${documentUpdated.documentTitle}.pdf`,
                  path: documentUpdated.file
                }]
              });
            }
          }
          return response.sendSuccess({res, message: 'Document Signed Successfully', body: {data: documentUpdated}});
        }
        return response.sendError({
          res,
          message: 'Unable to sign document'
        });
      }
    } catch (error) {
      console.log(error, 'error of sign doc');
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
      return response.sendError({res, message: 'No Document found', statusCode: status.NOT_FOUND});
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async fetchSpecificDocument(req, res, next) {
    try {
      if (!req.params.documentId) {
        return response.sendError({res, message: 'document id is missing in request parameters'});
      }

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
      return response.sendError({
        res,
        message: 'Unable to find documents,try again'
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
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
    console.log(f, 'file in upload');
    const publicId = `document/${userId}/${f.name}`;
    const fileUploaded=await
    cloudinary.uploader.upload(f.tempFilePath, {
      format: f.mimetype.split('/')[1],
      resource_type: 'auto',
      public_id: publicId,
      secure: true,
    });
    return {file: f, path: fileUploaded.secure_url, name: f.name, publicId: publicId};
  } catch (error) {
    console.log(error);
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
    console.log(f, 'file in upload');
    const publicId = `signatures/${userId}/${f.name}`;
    const fileUploaded=await
    cloudinary.uploader.upload(f.tempFilePath, {
      resource_type: 'image',
      format: f.mimetype.split('/')[1],
      public_id: publicId,
      secure: true,
    });
    return {file: f, path: fileUploaded.secure_url};
  } catch (error) {
    console.log(error);
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
    console.log(f, 'file in upload');
    const fileUploaded=await
    cloudinary.uploader.upload(f, {
      public_id: publicId,
      secure: true,
    });
    console.log(fileUploaded, 'file');
    return {path: fileUploaded.secure_url};
  } catch (error) {
    console.log(error);
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
  console.log(count, 'count');
  return count===data.length?true:false;
}
/**
 * Function to save file locally
 *
 * @param   {ArrayBuffer}  data  [data description]
 * @param   {String}  id    [id description]
 *
 * @return  {Object}        [return description]
 */
function saveFile(data, id) {
  return new Promise((resolve)=>{
    fs.writeFile(`${id}`, data, (err, f)=>{
      if (err) {
        console.log(err);
        resolve(false);
      }
      console.log(f, 'file');
      resolve(f);
    });
  });
}
module.exports=DocumentController;
