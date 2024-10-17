import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import axios from 'axios'; // اضافه کردن axios

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly senderNumber: string;
  private readonly signature: string;

  constructor() {
    this.senderNumber = process.env.PARSGREEN_SENDER_NUMBER || 'testSender';
    this.signature = process.env.PARSGREEN_SIGNATURE || 'testSignature';
  }

  async sendVerificationCode(phone: string, code: string): Promise<void> {
    // کد تأیید همیشه در لاگ چاپ شود
    this.logger.log(`Verification code for ${phone} is ${code}`);

    if (process.env.NODE_ENV === 'development') {
      // در محیط توسعه، فقط کد در لاگ نمایش داده می‌شود
      this.logger.log(`Development Mode: Skipping SMS send for ${phone}`);
    } else {
      try {
        const message = `Your verification code is ${code}`;
        // ارسال درخواست به API در محیط غیر توسعه
        const response = await axios.get(`http://sms.parsgreen.ir/UrlService/sendSMS.ashx`, {
          params: {
            from: this.senderNumber,
            to: phone,
            text: message,
            signature: this.signature,
          },
        });

        if (response.status === 200) {
          this.logger.log(`Verification code sent to ${phone}`);
        } else {
          this.logger.error(`Failed to send SMS to ${phone}: ${response.data}`);
          throw new InternalServerErrorException('Failed to send verification code. Please try again.');
        }
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error(`Error sending SMS to ${phone}: ${error.message}`);
        } else {
          this.logger.error(`Error sending SMS to ${phone}: ${error}`);
        }
        throw new InternalServerErrorException('Failed to send verification code. Please try again.');
      }
    }
  }
}
