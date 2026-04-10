import { User, UserRole } from "@ecommerce/shared";
import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService{
    constructor(
        private userRepository: Repository<User>,
        private jwtService: JwtService
    ){}

    async register(
        email:string,
        password:string,
        firstName:string,
        lastName:string
    ):Promise<{access_token:string}>{
        const existingUser = await this.userRepository.findOne({where:{email}});
        if (existingUser){
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = this.userRepository.create({
            email,
            password:hashedPassword,
            firstName,
            lastName,
            role:UserRole.CUSTOMER,
        })

        await this.userRepository.save(user);
        return this.generateToken(user);
        
    }

    async login(email:string,password:string):Promise<{access_token:string}>{
        const user = await this.userRepository.findOne({where:{email}});
        if(!user){
            throw new UnauthorizedException("Invalid email or password");
        }
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            throw new UnauthorizedException("Invalid email or password");
        }

        user.lastLogin = new Date();
        await this.userRepository.save(user);

        return this.generateToken(user);
    }

    async generateToken(user:User):Promise<{access_token:string}>{
        const payload = {
            sub:user.id,
            email:user.email,
            role:user.role
        }
        return {access_token:this.jwtService.sign(payload)};
    }

    async verifyToken(token:string):Promise<User>{
        try {
            const decode = this.jwtService.verify(token);
            return decode
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    async findById(id:string):Promise<User| null> {
        return this.userRepository.findOne({where:{id}});
    }
}