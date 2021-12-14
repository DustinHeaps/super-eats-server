import { Injectable, Inject } from '@nestjs/common';
import got from 'got';
import { CONFIG_OPTIONS } from 'src/shared/constants/shared.constants';
import { EmailModuleOptions, EmailVars } from './email.interfaces';
import * as FormData from 'form-data';
const nodemailer = require('nodemailer');
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
// import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: EmailModuleOptions,
  ) {}

  

  // private async sendEmail(subject: string, emailTo: string, template: string, emailVars: IEmailVars[]) {
  private async sendEmail(emailTo: string, code: string) {
    const url = `https://super-eats.netlify.app/confirm?code=${code}`;

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'supereats123@gmail.com', // generated ethereal user
        pass: 'Supereats!', // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: 'Super Eats', // sender address
      to: emailTo, // list of receivers
      subject: 'Confirm Email', // Subject line
      // plain text body
      html: `<a href="${url}">Confirm Email</a>`, // html body
    });
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail(email, code);
  }
}
