import { Body, Controller, Post } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  @Post('')
  async processPaddlePayment(@Body() body) {
    console.log(body)
    return {success: true}
  }
}
