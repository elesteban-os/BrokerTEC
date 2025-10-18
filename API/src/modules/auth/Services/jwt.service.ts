// Servicio para manejo de JWT tokens
import jwt from 'jsonwebtoken';
import { ENV } from '../../../config/env';
import { JwtPayload, TokenPair, AuthenticatedUser } from '../auth.types';

export class JwtService {
  /**
   * Generar par de tokens (access + refresh)
   */
  async generateTokenPair(user: AuthenticatedUser): Promise<TokenPair> {
    const payload: JwtPayload = {
      id_user: user.id_user, // int
      alias: user.alias,
      email: user.email,
      role: user.role,
      token_version: user.token_version
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      access_token: accessToken,
      refresh_token: refreshToken
    };
  }

  /**
   * Generar access token (corta duración)
   */
  private generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_ACCESS_EXPIRATION as any,
      issuer: 'BrokerTEC',
      audience: 'BrokerTEC-Users'
    });
  }

  /**
   * Generar refresh token (larga duración)
   */
  private generateRefreshToken(payload: JwtPayload): string {
    // Para refresh token, solo incluimos info mínima
    const refreshPayload = {
      id_user: payload.id_user, // int
      token_version: payload.token_version
    };

    return jwt.sign(refreshPayload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_REFRESH_EXPIRATION as any,
      issuer: 'BrokerTEC',
      audience: 'BrokerTEC-Refresh'
    });
  }

  /**
   * Verificar y decodificar token
   */
  async verifyToken(token: string, isRefreshToken = false): Promise<JwtPayload> {
    try {
      const audience = isRefreshToken ? 'BrokerTEC-Refresh' : 'BrokerTEC-Users';
      
      const decoded = jwt.verify(token, ENV.JWT_SECRET, {
        issuer: 'BrokerTEC',
        audience: audience
      }) as JwtPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido');
      } else {
        throw new Error('Error al verificar token');
      }
    }
  }

  /**
   * Extraer token del header Authorization
   */
  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
}
