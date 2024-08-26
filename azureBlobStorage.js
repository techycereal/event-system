// azureBlobService.js
const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
const crypto = require('crypto');

const connectionString = 'DefaultEndpointsProtocol=https;AccountName=eventsystemstorage;AccountKey=/L8kHg212CbCeJ9xywkusmSA+REW4OzWixOEvHnoRhxDldvlbFofqXpA7VkkIdbZfJWuIy0CmyJD+ASt4lxf9g==;EndpointSuffix=core.windows.net'; // Replace with your Azure Storage connection string
const containerName = 'events'; // Replace with your container name

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

const uploadFileToBlob = async (filePath, originalName) => {
  const blobName = `${crypto.randomBytes(16).toString('hex')}-${originalName}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.uploadFile(filePath);
    return blockBlobClient.url; // Return the URL of the uploaded blob
  } catch (error) {
    throw new Error(`Error uploading file to Blob Storage: ${error.message}`);
  }
};

module.exports = { uploadFileToBlob };
