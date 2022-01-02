import { Db, MongoClient, ObjectId, WithId } from 'mongodb'
import { isDev } from 'server/mode'

const uri = process.env.DB_URI
const dbName = process.env.DB_NAME
if (!uri || !dbName) {
  throw new Error('no database uri or name set')
}

let db: Db | undefined = undefined

export async function getDB(): Promise<Db> {
  if (db) {
    return db
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (isDev && global._mongodb) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    db = global._mongodb as Db
    return db
  }

  const connectedDB = await connectDB()

  db = connectedDB
  if (isDev) {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global._mongodb = connectedDB
  }

  return connectedDB
}

async function connectDB(): Promise<Db> {
  if (!uri || !dbName) {
    throw new Error('no database uri or name set')
  }

  const client = new MongoClient(uri)
  await client.connect()

  const db = client.db(dbName)
  await db.command({ ping: 1 })

  return db
}

export type Exported<T> = T & { id: string; _id?: ObjectId }

export function getExported<T>(model: T, id?: string): Exported<T> {
  const exported: Exported<T> = {
    id: id ? id : ((model as WithId<T>)._id as ObjectId).toString(),
    ...model,
  }
  delete exported._id

  return exported
}
