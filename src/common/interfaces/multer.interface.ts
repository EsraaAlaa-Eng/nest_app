import { S3Client } from "@aws-sdk/client-s3";


export interface IMulterFile extends Express.Multer.File {
    finalPath: string
}



