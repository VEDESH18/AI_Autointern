const authService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshAccessToken(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.userId);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req, res, next) {
    try {
      const result = await authService.googleAuth(req.user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
