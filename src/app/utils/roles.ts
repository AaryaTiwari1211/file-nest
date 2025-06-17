import { Roles } from '@/app/types/globals'
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

export const checkRole = async (role: Roles, req: NextRequest) => {
    const { sessionClaims } = getAuth(req)
    console.log("Session Claims:", sessionClaims)
    return sessionClaims?.metadata.role === role
}
