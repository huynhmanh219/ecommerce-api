import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { timestamp } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  
  @Get("status")
  getStatus():object{
    return{
      status:"up",
      timestamp:new Date(),
      version:"1.0.0"
    }
  }
}
