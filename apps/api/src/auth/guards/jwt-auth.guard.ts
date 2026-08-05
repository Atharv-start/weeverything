import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { verifyToken, createClerkClient } from '@clerk/backend';
import { PrismaClient } from '@weeverything/database';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private clerkClient;

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaClient,
  ) {
    if (!process.env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY environment variable is not set. Check your .env file.');
    }
    this.clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    let claims;
    try {
      claims = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired Clerk token');
    }

    const clerkUserId = claims.sub;

    // Check if user exists in SQLite by clerkId
    let user = await this.prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      // Fetch details from Clerk backend API to sync/create locally
      try {
        const clerkUser = await this.clerkClient.users.getUser(clerkUserId);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress;
        if (!email) {
          throw new UnauthorizedException('Clerk user does not have a primary email address');
        }

        // Try finding user by email in SQLite to link legacy accounts
        const existingEmailUser = await this.prisma.user.findUnique({
          where: { email },
        });

        if (existingEmailUser) {
          // Link Clerk ID to existing SQLite user record
          const updatedUser = await this.prisma.user.update({
            where: { id: existingEmailUser.id },
            data: { clerkId: clerkUserId },
            select: {
              id: true,
              email: true,
              username: true,
              displayName: true,
              role: true,
              status: true,
            },
          });
          user = updatedUser;
        } else {
          // Create new local SQLite user record
          const username = clerkUser.username || email.split('@')[0] + Math.floor(Math.random() * 1000);
          const displayName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || username;
          
          const newUser = await this.prisma.user.create({
            data: {
              clerkId: clerkUserId,
              email,
              username,
              displayName,
              role: 'USER',
              status: 'ACTIVE',
              profile: {
                create: {
                  avatarUrl: clerkUser.imageUrl || null,
                  bio: 'New WeEverything User',
                },
              },
              wallet: {
                create: {
                  isActive: true,
                },
              },
              privacySetting: {
                create: {
                  profileVisibility: 'PUBLIC',
                },
              },
            },
            select: {
              id: true,
              email: true,
              username: true,
              displayName: true,
              role: true,
              status: true,
            },
          });

          // Create initial ledger transaction to seed new user with ₹1000.00
          try {
            const systemTx = await this.prisma.ledgerTransaction.create({
              data: {
                idempotencyKey: `seed_${newUser.id}`,
                description: 'Sign Up welcome bonus',
                totalAmount: 100000,
                entries: {
                  create: {
                    wallet: { connect: { userId: newUser.id } },
                    type: 'CREDIT',
                    amount: 100000,
                    balanceAfter: 100000,
                    description: 'Sign Up welcome bonus',
                  },
                },
              },
            });
          } catch (e) {
            console.error('Failed to seed initial wallet ledger', e);
          }

          user = newUser;
        }
      } catch (err: any) {
        throw new UnauthorizedException(`Failed to sync Clerk user with local database: ${err.message}`);
      }
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is suspended or inactive');
    }

    request.user = user;
    return true;
  }
}
