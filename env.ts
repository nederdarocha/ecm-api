/*
|--------------------------------------------------------------------------
| Validating Environment Variables
|--------------------------------------------------------------------------
|
| In this file we define the rules for validating environment variables.
| By performing validation we ensure that your application is running in
| a stable environment with correct configuration values.
|
| This file is read automatically by the framework during the boot lifecycle
| and hence do not rename or move this file to a different location.
|
*/

import Env from "@ioc:Adonis/Core/Env";

export default Env.rules({
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: "host" }),
  CORS: Env.schema.string(),
  APP_KEY: Env.schema.string(),
  API_URL: Env.schema.string(),
  APP_URL: Env.schema.string(),
  APP_NAME: Env.schema.string(),
  USER_PASSWORD: Env.schema.string.optional(),
  NODE_ENV: Env.schema.enum(["development", "production", "testing", "test"] as const),
  // jwt
  JWT_PRIVATE_KEY: Env.schema.string(),
  JWT_PUBLIC_KEY: Env.schema.string(),
  JWT_DEFAULT_EXPIRE: Env.schema.string(),
  JWT_REFRESH_TOKEN_EXPIRE: Env.schema.string(),
  //
  DRIVE_DISK: Env.schema.enum(["local", "s3"] as const),
  MAX_UPLOAD_FILE_SIZE: Env.schema.string(),

  // aws s3
  S3_KEY: Env.schema.string(),
  S3_SECRET: Env.schema.string(),
  S3_BUCKET: Env.schema.string(),
  S3_REGION: Env.schema.string(),
  S3_ENDPOINT: Env.schema.string.optional(), //https://s3.us-east-1.amazonaws.com
  // mail
  MAIL_DRIVER: Env.schema.enum(["smtp", "ses"] as const),
  MAIL_FROM: Env.schema.string(),
  MAIL_NAME: Env.schema.string(),
  MAIL_SUBJECT: Env.schema.string(),
  SMTP_HOST: Env.schema.string({ format: "host" }),
  SMTP_PORT: Env.schema.number(),
  SMTP_USERNAME: Env.schema.string(),
  SMTP_PASSWORD: Env.schema.string(),
  // aws ses
  SES_ACCESS_KEY: Env.schema.string(),
  SES_ACCESS_SECRET: Env.schema.string(),
  SES_REGION: Env.schema.string(),
  //
  CACHE_VIEWS: Env.schema.boolean(),
});
