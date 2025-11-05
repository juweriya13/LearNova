'use client';

import { getAuth, type User } from 'firebase/auth';

/* ---------------------------------------------------------------------------
   🧠 Type Definitions
--------------------------------------------------------------------------- */

type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

interface FirebaseAuthToken {
  name: string | null;
  email: string | null;
  email_verified: boolean;
  phone_number: string | null;
  sub: string;
  firebase: {
    identities: Record<string, string[]>;
    sign_in_provider: string;
    tenant: string | null;
  };
}

interface FirebaseAuthObject {
  uid: string;
  token: FirebaseAuthToken;
}

interface SecurityRuleRequest {
  auth: FirebaseAuthObject | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

/* ---------------------------------------------------------------------------
   🧩 Helper Functions
--------------------------------------------------------------------------- */

function buildAuthObject(currentUser: User | null): FirebaseAuthObject | null {
  if (!currentUser) return null;

  return {
    uid: currentUser.uid,
    token: {
      name: currentUser.displayName,
      email: currentUser.email,
      email_verified: currentUser.emailVerified,
      phone_number: currentUser.phoneNumber,
      sub: currentUser.uid,
      firebase: {
        identities: currentUser.providerData.reduce((acc, p) => {
          if (p.providerId && p.uid) acc[p.providerId] = [p.uid];
          return acc;
        }, {} as Record<string, string[]>),
        sign_in_provider: currentUser.providerData[0]?.providerId || 'custom',
        tenant: currentUser.tenantId ?? null,
      },
    },
  };
}

function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
  let authObject: FirebaseAuthObject | null = null;

  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) authObject = buildAuthObject(currentUser);
  } catch {
    // Firebase may not yet be initialized — ignore
  }

  return {
    auth: authObject,
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData
      ? { data: context.requestResourceData }
      : undefined,
  };
}

function buildErrorMessage(requestObject: SecurityRuleRequest): string {
  return (
    'Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n' +
    JSON.stringify(requestObject, null, 2)
  );
}

/* ---------------------------------------------------------------------------
   🚨 FirestorePermissionError Class
--------------------------------------------------------------------------- */

/**
 * 👑 FirestorePermissionError
 * Creates a structured Firestore-style permission-denied error object.
 */
export class FirestorePermissionError extends Error {
  public readonly request: SecurityRuleRequest;

  constructor(context: SecurityRuleContext) {
    const requestObject = buildRequestObject(context);
    super(buildErrorMessage(requestObject));

    this.name = 'FirestorePermissionError';
    this.request = requestObject;

    // Fix prototype for `instanceof`
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }
}

/* ---------------------------------------------------------------------------
   ✅ Notes
--------------------------------------------------------------------------- */
// ⚠️ DO NOT re-export FirestorePermissionError again at the bottom!
// ❌ Remove any duplicate lines like:
// export { FirestorePermissionError };
// export default FirestorePermissionError;