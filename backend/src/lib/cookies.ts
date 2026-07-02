import type { NextRequest, NextResponse } from 'next/server'

export const AUTH_COOKIE_NAME = 'fuzzy_auth'
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

const baseCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    ...baseCookieOptions,
    maxAge: AUTH_COOKIE_MAX_AGE,
  })
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    ...baseCookieOptions,
    maxAge: 0,
  })
}

export function getAuthCookie(request: NextRequest) {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value
}
