import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { config } from '../../config/environment';
import { buildNavigation, flattenAccess, menuCodesFromNavigation } from '../../lib/access';
import { LoginInput, VerifyOtpInput } from './auth.schema';

export class AuthService {
  /**
   * Step 1: Login with username/email & password
   * Generates OTP Challenge Token (Dummy OTP: 00000)
   */
  static async login(input: LoginInput, ipAddress?: string) {
    const { usernameOrEmail, password } = input;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail },
        ],
      },
    });

    if (!user) {
      throw { statusCode: 401, message: 'Username atau email tidak terdaftar.' };
    }

    if (!user.isActive) {
      throw { statusCode: 403, message: 'Akun Anda dinonaktifkan. Silakan hubungi Administrator.' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw { statusCode: 401, message: 'Password yang Anda masukkan salah.' };
    }

    // Create OTP Token record (expires in 10 minutes)
    const otpRecord = await prisma.otpToken.create({
      data: {
        userId: user.id,
        code: config.dummyOtp, // "00000"
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        isUsed: false,
      },
    });

    try {
      await prisma.auditTrail.create({
        data: {
          userId: user.id,
          action: 'AUTH_LOGIN_CHALLENGE',
          details: { challengeId: otpRecord.id },
          ipAddress,
        },
      });
    } catch (auditErr) {
      console.warn('Audit trail logging warning (login):', auditErr);
    }

    return {
      challengeId: otpRecord.id,
      message: 'Kredensial valid. Silakan masukkan kode OTP 5 digit (Dummy OTP: 00000).',
      expiresInSeconds: 600,
    };
  }

  /**
   * Step 2: Verify 5-digit OTP Code (Dummy: 00000)
   * Issues AccessToken (JWT) & RefreshToken
   */
  static async verifyOtp(input: VerifyOtpInput, ipAddress?: string) {
    const { challengeId, otp } = input;

    const otpRecord = await prisma.otpToken.findUnique({
      where: { id: challengeId },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!otpRecord) {
      throw { statusCode: 404, message: 'Tantangan OTP tidak ditemukan atau telah kadaluarsa.' };
    }

    if (otpRecord.isUsed) {
      throw { statusCode: 400, message: 'Kode OTP ini telah digunakan sebelumnya.' };
    }

    if (new Date() > otpRecord.expiresAt) {
      throw { statusCode: 400, message: 'Kode OTP telah kadaluarsa. Silakan login kembali.' };
    }

    if (otp !== otpRecord.code && otp !== config.dummyOtp) {
      throw { statusCode: 400, message: 'Kode OTP yang Anda masukkan salah (Gunakan: 00000).' };
    }

    // Mark OTP as used and user verified
    await prisma.otpToken.update({
      where: { id: challengeId },
      data: { isUsed: true },
    });

    await prisma.user.update({
      where: { id: otpRecord.userId },
      data: { isOtpVerified: true },
    });

    const user = otpRecord.user;
    const { roles, permissions } = flattenAccess(user.userRoles);
    const navigation = await buildNavigation(roles, permissions);

    // Issue JWT tokens
    const accessTokenOptions: SignOptions = { expiresIn: '1d' };
    const refreshTokenOptions: SignOptions = { expiresIn: '7d' };

    const accessToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        roles,
      },
      config.jwtSecret as Secret,
      accessTokenOptions
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwtRefreshSecret as Secret,
      refreshTokenOptions
    );

    try {
      await prisma.auditTrail.create({
        data: {
          userId: user.id,
          action: 'AUTH_VERIFY_OTP_SUCCESS',
          details: { roles },
          ipAddress,
        },
      });
    } catch (auditErr) {
      console.warn('Audit trail logging warning (verifyOtp):', auditErr);
    }

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: config.jwtExpiresIn,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        namaLengkap: user.namaLengkap,
        nomorHp: user.nomorHp,
        nip: user.nip,
        roles,
        permissions,
        menus: menuCodesFromNavigation(navigation),
        navigation,
      },
    };
  }

  /**
   * Get Current Authenticated User Profile & Permissions
   */
  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User tidak ditemukan.' };
    }

    const { roles, permissions } = flattenAccess(user.userRoles);
    const navigation = await buildNavigation(roles, permissions);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      namaLengkap: user.namaLengkap,
      nomorHp: user.nomorHp,
      nip: user.nip,
      isActive: user.isActive,
      isOtpVerified: user.isOtpVerified,
      roles,
      permissions,
      menus: menuCodesFromNavigation(navigation),
      navigation,
    };
  }

  /**
   * Refresh Access Token
   */
  static async refreshToken(refreshTokenInput: string) {
    try {
      const decoded = jwt.verify(refreshTokenInput, config.jwtRefreshSecret as Secret) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user || !user.isActive) {
        throw { statusCode: 401, message: 'Refresh token tidak valid atau pengguna dinonaktifkan.' };
      }

      const roles = user.userRoles.map((ur) => ur.role.kodeRole);

      const accessTokenOptions: SignOptions = { expiresIn: '1d' };
      const accessToken = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email,
          roles,
        },
        config.jwtSecret as Secret,
        accessTokenOptions
      );

      return {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: config.jwtExpiresIn,
      };
    } catch (err) {
      throw { statusCode: 401, message: 'Refresh token tidak valid atau kadaluarsa.' };
    }
  }
}
