import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(
  message: string,
  status: number,
  errors?: unknown,
) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(errors === undefined ? {} : { errors }),
    },
    { status },
  )
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return errorResponse(error.message, error.status, error.errors)
  }

  console.error('Unhandled API error', error)
  return errorResponse('Đã xảy ra lỗi hệ thống.', 500)
}
