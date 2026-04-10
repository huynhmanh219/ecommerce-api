import { BadRequestException, Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto, LoginDto } from "./dtos";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";


@Controller()
export class AuthController{
    constructor(
        private authService:AuthService
    ){}

    /**
   * POST /api/auth/register
   * 
   * Example request:
   * {
   *   "email": "user@example.com",
   *   "password": "SecurePassword123",
   *   "firstName": "John",
   *   "lastName": "Doe"
   * }
   *
   * Response:
   * {
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * }
   */
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto){
        try{
            return await this.authService.register(
                createUserDto.email,
                createUserDto.password,
                createUserDto.firstName,
                createUserDto.lastName
            );
        }catch (error){
            throw new BadRequestException(error);
        }
    }
    

    /**
   * POST /api/auth/login
   *
   * Example request:
   * {
   *   "email": "user@example.com",
   *   "password": "SecurePassword123"
   * }
   *
   * Response:
   * {
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * }
   *
   * Usage by other services:
   * 1. Frontend login endpoint
   * 2. Sends credentials
   * 3. Gets JWT token
   * 4. Sends token in Authorization header on future requests
   * 5. Gateway validates token in Auth Service
   */
    @Post('login')
    async login(@Body() loginDto:LoginDto){
        return this.authService.login(loginDto.email, loginDto.password);
    }
    
      /**
   * POST /api/auth/login
   *
   * Example request:
   * {
   *   "email": "user@example.com",
   *   "password": "SecurePassword123"
   * }
   *
   * Response:
   * {
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * }
   *
   * Usage by other services:
   * 1. Frontend login endpoint
   * 2. Sends credentials
   * 3. Gets JWT token
   * 4. Sends token in Authorization header on future requests
   * 5. Gateway validates token in Auth Service
   */
    @Post('verify')
    async verify(@Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return this.authService.verifyToken(token);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@Request() req){
        return req.user;
    }
    
    
    @Get('health')
     health() {
    return { status: 'ok', service: 'auth' };
    }

}