import 'next-auth';
import 'next-auth/jwt';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    accessToken?: string;
  }

  interface Session {
    user: { id: string } & DefaultSession['user'];
    accessToken?: string;
    provider?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    accessTokenExpiresAt?: number;
    accessTokenError?: string;
    provider?: string;
    refreshToken?: string;
  }
}
