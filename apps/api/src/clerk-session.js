import { createRemoteJWKSet, jwtVerify } from 'jose';

const encodedHost = process.env.CLERK_PUBLISHABLE_KEY?.match(/^pk_(?:test|live)_([A-Za-z0-9_+=/-]+)$/)?.[1];
const frontend = encodedHost ? Buffer.from(encodedHost, 'base64').toString('utf8') : '';
const host = /^([a-z0-9.-]+)\$$/.exec(frontend)?.[1];
const issuer = host ? `https://${host}` : null;
const keys = issuer ? createRemoteJWKSet(new URL('/.well-known/jwks.json', issuer), { timeoutDuration: 5000 }) : null;

export async function verifyClerkSession(token, origin) {
  if (!issuer || !keys) return null;
  const { payload } = await jwtVerify(token, keys, {
    algorithms: ['RS256'],
    issuer,
    requiredClaims: ['sub', 'sid', 'exp', 'nbf', 'azp'],
    clockTolerance: 5,
  });
  if (
    typeof payload.sub !== 'string' || !payload.sub.startsWith('user_') ||
    typeof payload.sid !== 'string' || !payload.sid.startsWith('sess_') ||
    payload.azp !== origin || (payload.sts !== undefined && payload.sts !== 'active')
  ) return null;
  return payload.sub;
}


export async function authenticate(req) {
  const origin = req.get('Origin');
  const authorization = req.get('Authorization');
  if (!origin || !authorization?.startsWith('Bearer ')) return null;
  try {
    return await verifyClerkSession(authorization.slice('Bearer '.length), origin);
  } catch {
    return null;
  }
}
