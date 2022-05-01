import { getDB } from 'server/model/database'

export interface IDSchemeModel {
  projectID: string
  name: string
  howTo?: string
}

const collName = 'idSchemes'

export async function upsertIDScheme(newScheme: IDSchemeModel): Promise<void> {
  const db = await getDB()

  await db
    .collection<IDSchemeModel>(collName)
    .updateOne(
      { name: newScheme.name, projectID: newScheme.projectID },
      { $set: { ...newScheme } },
      { upsert: true },
    )
}

export async function upsertIDSchemes(
  names: string[],
  projectID: string,
): Promise<void> {
  const db = await getDB()

  await db.collection<IDSchemeModel>(collName).bulkWrite(
    names.map((name) => ({
      updateOne: {
        filter: { name, projectID },
        update: { $set: { name, projectID } },
        upsert: true,
      },
    })),
  )
}
