const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

class AuthService {
  async register({ email, password, firstName, lastName, phone }) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone
      }
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      accessToken,
      refreshToken
    };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      accessToken,
      refreshToken
    };
  }

  async refreshAccessToken(refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      const newAccessToken = generateAccessToken(user.id);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });
  }

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async googleAuth(profile) {
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id }
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: profile.emails[0].value }
      });

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.id }
        });
      } else {
        user = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName
          }
        });
      }
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      accessToken,
      refreshToken
    };
  }
}

module.exports = new AuthService();
