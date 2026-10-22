import { NextResponse } from 'next/server'
import { withApi } from '@/lib/api/route'
import { permissions } from '@/lib/auth/permissions'

export const GET = withApi(async (_request, { user, profile }) => NextResponse.json({ data: { id: user.id, profile, permissions: permissions(profile) } }))
