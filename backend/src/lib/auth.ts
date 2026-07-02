import jwt, { type JwtPayload } from 'jsonwebtoken'
import type { NextRequest } from 'next/server'

import { ApiError } from '@/lib/api-response'
import { getAuthCookie } from '@/lib/cookies'

const TOKEN_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7

interface AuthTokenPayload extends JwtPayload {
  sub: string
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return secret
}

export function signAuthToken(userId: string) {
  return jwt.sign({}, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: TOKEN_EXPIRES_IN_SECONDS,
    subject: userId,
  })
}

export function verifyAuthToken(token: string) {
  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    }) as AuthTokenPayload

    if (!payload.sub) {
      throw new ApiError(401, 'Phiên đăng nhập không hợp lệ.')
    }

    return payload
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.')
  }
}

export function getAuthenticatedUserId(request: NextRequest) {
  const token = getAuthCookie(request)

  if (!token) {
    throw new ApiError(401, 'Bạn chưa đăng nhập.')
  }

  return verifyAuthToken(token).sub
}
