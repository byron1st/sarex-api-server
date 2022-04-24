import { ObjectId } from 'mongodb'
import { Exported, getDB, getExported } from 'server/model/database'

export interface CIPModel {
  projectID: string
  connectorType: string
  sourceIDScheme: string[] // name
  targetIDScheme: string[] // name
  functionCondition: string
  variableConditions: string[]
}

const collName = 'cips'

export async function createCIP(newCIP: CIPModel): Promise<Exported<CIPModel>> {
  const db = await getDB()

  const result = await db.collection<CIPModel>(collName).insertOne(newCIP)

  return getExported<CIPModel>(newCIP, result.insertedId.toString())
}

export async function readCIPsByType(
  projectID: string,
  connectorType: string,
): Promise<Exported<CIPModel>[]> {
  const db = await getDB()

  const cips = await db
    .collection<CIPModel>(collName)
    .find({ projectID, connectorType })
    .toArray()

  return cips.map((cip) => getExported<CIPModel>(cip))
}

export async function updateCIP(
  id: string,
  cip: Partial<CIPModel>,
): Promise<void> {
  const db = await getDB()

  await db
    .collection<CIPModel>(collName)
    .updateOne({ _id: new ObjectId(id) }, { $set: cip })
}

export async function deleteCIP(id: string): Promise<void> {
  const db = await getDB()

  await db.collection<CIPModel>(collName).deleteOne({ _id: new ObjectId(id) })
}
