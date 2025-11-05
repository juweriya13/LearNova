'use client';

import { useEffect, useState } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { FirestorePermissionError } from '../errors';
import { errorEmitter } from '../error-emitter';

/* ---------------------------------------------------------------------------
   📘 Types
--------------------------------------------------------------------------- */

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/** Internal query type for accessing the canonical Firestore path */
interface InternalQuery extends Query<DocumentData> {
  _query: { path: { canonicalString(): string } };
}

/* ---------------------------------------------------------------------------
   🧠 Main Hook: useCollection
--------------------------------------------------------------------------- */
/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * ✅ Handles permission errors with structured context.
 * ✅ Emits errors globally via `errorEmitter`.
 */
export function useCollection<T = DocumentData>(
  refOrQuery:
    | ((CollectionReference<DocumentData> | Query<DocumentData>) & { __memo?: boolean })
    | null
    | undefined
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // 🛑 Guard clause – if no query reference, reset and stop
    if (!refOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);

    // 👑 Subscribe to Firestore in real-time
    const unsubscribe = onSnapshot(
      refOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: WithId<T>[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as T),
          id: doc.id,
        }));

        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (firestoreError: FirestoreError) => {
        // ⚠️ Firestore permission or path errors
        let path = 'unknown';
        try {
          path =
            refOrQuery.type === 'collection'
              ? (refOrQuery as CollectionReference).path
              : (refOrQuery as unknown as InternalQuery)._query.path.canonicalString();
        } catch {
          // silently fail if path extraction fails
        }

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        });

        setError(contextualError);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);

        if (process.env.NODE_ENV === 'development') {
          console.warn('🔥 Firestore permission error:', contextualError.message);
        }
      }
    );

    // 🧹 Clean up on unmount
    return () => unsubscribe();
  }, [refOrQuery]);

  return { data, isLoading, error };
}
