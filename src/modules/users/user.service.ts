import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';

export class UserService {
  static async getUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        namaLengkap: true,
        nomorHp: true,
        nip: true,
        isActive: true,
        isOtpVerified: true,
        userRoles: {
          include: {
            role: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        namaLengkap: true,
        nomorHp: true,
        nip: true,
        isActive: true,
        isOtpVerified: true,
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
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User tidak ditemukan.' };
    }

    return user;
  }

  static async createUser(data: {
    username: string;
    email: string;
    password: string;
    namaLengkap: string;
    nomorHp?: string;
    nip?: string;
    roleIds?: string[];
  }) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    });

    if (existing) {
      throw { statusCode: 400, message: 'Username atau Email sudah terdaftar.' };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        namaLengkap: data.namaLengkap,
        nomorHp: data.nomorHp,
        nip: data.nip,
        isActive: true,
      },
    });

    if (data.roleIds && data.roleIds.length > 0) {
      const roles = await prisma.role.findMany({
        where: {
          OR: [
            { id: { in: data.roleIds } },
            { kodeRole: { in: data.roleIds } },
          ],
        },
      });

      if (roles.length > 0) {
        await prisma.userRole.createMany({
          data: roles.map((r) => ({
            userId: user.id,
            roleId: r.id,
          })),
        });
      }
    }

    return this.getUserById(user.id);
  }

  static async updateUser(
    id: string,
    data: {
      namaLengkap?: string;
      nomorHp?: string;
      nip?: string;
      isActive?: boolean;
      password?: string;
      roleIds?: string[];
    }
  ) {
    const updateData: any = {};

    if (data.namaLengkap !== undefined) updateData.namaLengkap = data.namaLengkap;
    if (data.nomorHp !== undefined) updateData.nomorHp = data.nomorHp;
    if (data.nip !== undefined) updateData.nip = data.nip;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    if (data.roleIds !== undefined) {
      await prisma.userRole.deleteMany({ where: { userId: id } });
      if (data.roleIds.length > 0) {
        const roles = await prisma.role.findMany({
          where: {
            OR: [
              { id: { in: data.roleIds } },
              { kodeRole: { in: data.roleIds } },
            ],
          },
        });

        if (roles.length > 0) {
          await prisma.userRole.createMany({
            data: roles.map((r) => ({
              userId: id,
              roleId: r.id,
            })),
          });
        }
      }
    }

    return this.getUserById(id);
  }

  static async deleteUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
