import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getAllUsers, createUser, createLdapUser, getUserCountByRole } from '@/lib/users';
import { isLdapEnabled } from '@/lib/ldap';
import { cookies } from 'next/headers';

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await validateSession(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Only admin can list all users
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const users = await getAllUsers();
    const counts = await getUserCountByRole();

    return NextResponse.json({
      users,
      counts,
      ldapEnabled: isLdapEnabled(),
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await validateSession(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Only admin can create users
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, password, role, auth_provider } = body;

    const validRoles = ['viewer', 'uploader', 'bucket-creator', 'admin'];

    if (!username || !role) {
      return NextResponse.json(
        { error: 'Username and role are required' },
        { status: 400 }
      );
    }

    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    const isLdap = auth_provider === 'ldap';

    if (isLdap && !isLdapEnabled()) {
      return NextResponse.json(
        { error: 'LDAP authentication is not configured on this server' },
        { status: 400 }
      );
    }

    if (!isLdap && !password) {
      return NextResponse.json(
        { error: 'Password is required for local users' },
        { status: 400 }
      );
    }

    const newUser = isLdap
      ? await createLdapUser({ username, role, createdBy: user.id, createdByUsername: user.username })
      : await createUser({ username, password, role, createdBy: user.id, createdByUsername: user.username });

    if (!newUser) {
      return NextResponse.json(
        { error: 'Failed to create user. Username may already exist.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
