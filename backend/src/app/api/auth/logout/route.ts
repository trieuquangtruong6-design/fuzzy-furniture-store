import { successResponse } from '@/lib/api-response'
import { clearAuthCookie } from '@/lib/cookies'

export async function POST() {
  const response = successResponse({ loggedOut: true })
  clearAuthCookie(response)

  return response
}
