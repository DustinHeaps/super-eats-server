import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import * as AWS from "aws-sdk";

// const BUCKET_NAME = 'bucket-abdddsss';

@Controller('uploads')
export class UploadsController {
//   @Get()
//   findAll(): string {
//     return 'This action returns all cats';
//   }

// @Post('upload')
// @UseInterceptors(FileInterceptor('file'))
// uploadFile(@UploadedFile() file:any) {
//   console.log(file);
// }
  
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
      },
    });
   const bucket = 'ubereats123432'
    try {
      // CREATE A NEW BUCKET 
    console.log('onvjkr4ngjkrngjkt4rbject')
      const objectName = `${Date.now() + file.originalname}`;
     const req = await new AWS.S3()
   
        .putObject({
          Body: file.buffer,
          Bucket: bucket,
          Key: objectName,
          ACL: 'public-read',
          ContentType: "image/png"
        })
        .promise();
// console.log(req)
      const url = `https://${bucket}.s3.us-east-2.amazonaws.com/${objectName}`;
      // 'https://ubereats123432.s3.us-east-2.amazonaws.com/16365859692361636583804885InvitaCaseStudy.jpg'
      return { url };
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}
// @Post('')
// @UseInterceptors(FileInterceptor('file'))
// uploadFile(@UploadedFile() file) {
//   console.log(file);
// }
// }