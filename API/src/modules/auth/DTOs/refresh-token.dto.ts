// DTOs para refresh token
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     RefreshTokenDto:
 *       type: object
 *       properties:
 *         refresh_token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       required:
 *         - refresh_token
 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refresh_token!: string;
}