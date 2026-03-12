import { db } from "./firebase"
import {
  collection,
  addDoc,
  getDocs,
  query as firestoreQuery,
  where,
  orderBy,
  limit as limitFn,
} from "firebase/firestore"

export interface FIRRecord {
  firNumber: string
  name?: string
  extractedInfo?: any
  metadata?: any
  createdAt?: string
}

export async function saveFIR(record: FIRRecord) {
  const col = collection(db, "firs")
  const payload = {
    ...record,
    createdAt: record.createdAt ?? new Date().toISOString(),
  }

  const docRef = await addDoc(col, payload)
  return { id: docRef.id, ...payload }
}

export async function queryFIRs(opts?: {
  start?: string
  end?: string
  name?: string
  firNumber?: string
  limit?: number
}) {
  const { start, end, name, firNumber, limit = 50 } = opts ?? {}
  const col = collection(db, "firs")

  const constraints: any[] = []
  if (start) constraints.push(where("createdAt", ">=", start))
  if (end) constraints.push(where("createdAt", "<=", end))
  if (name) constraints.push(where("name", "==", name))
  if (firNumber) constraints.push(where("firNumber", "==", firNumber))

  // Order by createdAt descending for recent-first
  constraints.push(orderBy("createdAt", "desc"))
  constraints.push(limitFn(limit))

  const q = firestoreQuery(col, ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
}
