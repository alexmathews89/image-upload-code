import dotenv from "dotenv";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { promisify } from "util";
const randomBytes = promisify(crypto.randomBytes);

dotenv.config();

const region = "us-west-2";
const bucketName = "cf-final-image-resize-source";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

export const s3 = new S3({
  region,

  accessKeyId,
  secretAccessKey,
  // The key signatureVersion is no longer supported in v3, and can be removed.
  // @deprecated SDK v3 only supports signature v4.
  //signatureVersion: "v4",
});

export async function generateUploadURL() {
  const rawBytes = await randomBytes(16);
  const imageName = rawBytes.toString("hex");

  const params = {
    Bucket: bucketName,
    Key: imageName,
    //ContentType: "image/jpeg",
    //Expires: 60,
  };

  const uploadURL = await getSignedUrl(s3, new PutObjectCommand(params), {
    expiresIn:
      //"/* add value from 'Expires' from v2 call if present, else remove */",
      60,
  });
  return uploadURL;
}
