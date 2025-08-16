import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
    private readonly SALT_ROUNDS = 12;

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) { }

    async signup(payload: SignupDto) {
        try {
            const hashedPassword = await bcrypt.hash(payload.password, this.SALT_ROUNDS);
            const user = await this.prisma.user.create({
                data: {
                    ...payload,
                    password: hashedPassword,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    createdAt: true,
                },
            });
            return {
                ...user,
                accessToken: this.jwtService.sign({ id: user.id, email: user.email })
            };
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException('Email already exists');
                }
            }
            throw error;
        }
    }

    async login(payload: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: payload.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordValid = await bcrypt.compare(payload.password, user.password);
        if (!passwordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return {
            accessToken: this.jwtService.sign({ id: user.id, email: user.email })
        };
    }

    async getUser(userId: number) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            }
        });
    }
}