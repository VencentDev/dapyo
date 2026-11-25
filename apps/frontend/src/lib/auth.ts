import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import type { JWT } from 'next-auth/jwt';

export { protectedHomePath } from '@/lib/auth-routes';

async function refreshOAuthAccessToken(token: JWT): Promise<JWT> {
  const provider = token.provider;
  const providerConfig =
    provider === 'google'
      ? {
          tokenEndpoint: 'https://oauth2.googleapis.com/token',
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }
      : provider === 'github'
        ? {
            tokenEndpoint: 'https://github.com/login/oauth/access_token',
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
          }
        : undefined;

  if (
    !providerConfig ||
    !token.refreshToken ||
    !providerConfig.clientId ||
    !providerConfig.clientSecret
  ) {
    return { ...token, accessTokenError: 'RefreshTokenError' };
  }

  try {
    const response = await fetch(providerConfig.tokenEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
        client_id: providerConfig.clientId,
        client_secret: providerConfig.clientSecret,
      }),
      cache: 'no-store',
    });

    if (!response.ok) throw new Error('OAuth token refresh failed');

    const refreshed = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
    };
    if (!refreshed.access_token || !refreshed.expires_in) {
      throw new Error('OAuth token refresh response was incomplete');
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpiresAt: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      accessTokenError: undefined,
    };
  } catch {
    return { ...token, accessTokenError: 'RefreshTokenError' };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').trim();
        const password = String(credentials?.password ?? '');
        if (!email || !password) return null;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'}/api/v1/auth/login`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            cache: 'no-store',
          },
        );

        if (!response.ok) return null;
        const login = (await response.json()) as {
          user: { id: string; email: string; displayName: string };
          accessToken: string;
        };

        return {
          id: login.user.id,
          email: login.user.email,
          name: login.user.displayName,
          accessToken: login.accessToken,
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          scope: 'openid profile email',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.provider = account.provider;
        if (account.access_token) token.accessToken = account.access_token;
        if (account.expires_at) token.accessTokenExpiresAt = account.expires_at * 1000;
        if (account.refresh_token) token.refreshToken = account.refresh_token;
        token.accessTokenError = undefined;
      }
      if (user?.accessToken) token.accessToken = user.accessToken;

      if (
        (token.provider === 'google' || token.provider === 'github') &&
        token.accessTokenExpiresAt &&
        Date.now() >= token.accessTokenExpiresAt - 60_000 &&
        !token.accessTokenError
      ) {
        return refreshOAuthAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      session.accessToken = token.accessToken;
      session.provider = token.provider;
      return session;
    },
  },
});
