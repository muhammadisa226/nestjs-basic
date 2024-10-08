import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpException,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { UserService } from './user.service';
import { Connection } from '../connection/connection';
import { UserRepository } from '../user-repository/user-repository';
import { MemberService } from '../member/member.service';
import { MailService } from '../mail/mail.service';
import { User } from '@prisma/client';
import { ValidationFilter } from 'src/validation/validation.filter';
import {
  LoginUserRequest,
  loginUserRequestValidation,
} from 'src/model/login.model';
import { ValidationPipe } from 'src/validation/validation.pipe';
@Controller('/api/users')
export class UserController {
  constructor(
    private service: UserService,
    private connection: Connection,
    private mailService: MailService,
    private userRepository: UserRepository,
    private memberService: MemberService,
  ) {}

  @UseFilters(ValidationFilter)
  @Post('/login')
  login(
    @Body(new ValidationPipe(loginUserRequestValidation))
    request: LoginUserRequest,
  ) {
    return `Hello ${request.username}`;
  }
  @Get('/create')
  async create(
    @Query('firstName') firstName: string,
    @Query('lastName') lastName: string,
  ): Promise<User> {
    if (!firstName) {
      throw new HttpException(
        {
          code: 400,
          errors: 'First Name Is Required',
        },
        400,
      );
    }
    return this.userRepository.save(firstName, lastName);
  }
  @Get('/connection')
  async getConnection(): Promise<string> {
    this.mailService.send();
    console.info(this.memberService.getConnectionName());
    this.memberService.sendEmail();
    return this.connection.getName();
  }

  @Get('/hello-service')
  // @UseFilters(ValidationFilter)
  async sayHelloService(@Query('name') name: string): Promise<string> {
    return this.service.sayHello(name);
  }
  @Get('/view/hello')
  viewHello(@Query('name') name: string, @Res() response: Response) {
    response.render('index.html', {
      title: 'Template Engine',
      name: `Hello ${name}`,
    });
  }

  @Get('/set-cookie')
  setCookie(@Query('name') name: string, @Res() response: Response) {
    response.cookie('name', name);
    response.status(200).send('success set cookie');
  }
  @Get('/get-cookie')
  getCookie(@Req() request: Request): string {
    return request.cookies['name'];
  }
  @Get('/sample-response')
  @Header('Content-type', 'application/json')
  @HttpCode(200)
  sampleResponse(): Record<string, string> {
    return {
      data: 'Hello JSON',
    };
  }
  @Get('/hello')
  async getQuery(@Query('name') name: string): Promise<string> {
    return `Hello ${name}`;
  }
  @Get('/:id')
  getParams(@Param('id', ParseIntPipe) id: number): string {
    return `${id}`;
  }
  @Post()
  post(): string {
    return 'POST';
  }
  @Get('/sample')
  get(): string {
    return 'Heloo NestJS';
  }
}
