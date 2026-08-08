import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    usernameOrEmail: z.string().min(3, 'Username atau email minimal 3 karakter'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    challengeId: z.string().min(1, 'Challenge ID wajib diisi'),
    otp: z.string().length(5, 'Kode OTP harus tepat 5 digit (Gunakan: 00000)'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh Token wajib diisi'),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
