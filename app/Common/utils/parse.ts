import Env from "@ioc:Adonis/Core/Env";

export const parse = {
  urlS3(location: string): string {
    return `https://${Env.get("S3_BUCKET")}.s3.amazonaws.com/${location}`;
  },
};
