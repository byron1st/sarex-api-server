import { ObjectId } from 'mongodb'
import { Exported, getDB, getExported } from 'server/model/database'

export interface ConnectorTypeModel {
  projectID: string
  name: string
  relationIDs: string[]
}

const collName = 'connectorTypes'

export async function createConnectorType(
  projectID: string,
  name: string,
  relationID: string,
): Promise<void> {
  const db = await getDB()

  await db
    .collection<ConnectorTypeModel>(collName)
    .updateOne(
      { name },
      { $set: { projectID, name }, $addToSet: { relationIDs: relationID } },
      { upsert: true },
    )
}

export async function readConnectorType(
  idStr: string,
): Promise<Exported<ConnectorTypeModel>> {
  const db = await getDB()

  const connectorType = await db
    .collection<ConnectorTypeModel>(collName)
    .findOne({ _id: new ObjectId(idStr) })
  if (connectorType === null) {
    throw new Error('no such connector type')
  }

  return getExported<ConnectorTypeModel>(connectorType)
}

export async function readConnectorTypes(
  projectID: string,
): Promise<Exported<ConnectorTypeModel>[]> {
  const db = await getDB()

  const types = await db
    .collection<ConnectorTypeModel>(collName)
    .find({ projectID })
    .toArray()

  return types.map((t) => getExported<ConnectorTypeModel>(t))
}

export async function updateConnectorType(
  id: string,
  name?: string,
  relation?: { id: string; op: 'add' | 'delete' },
): Promise<void> {
  const db = await getDB()

  const updates: Record<string, unknown> = {}
  if (name) {
    updates['$set'] = { name }
  }
  if (relation) {
    updates[relation.op === 'add' ? '$addToSet' : '$pull'] = {
      relationIDs: relation.id,
    }
  }

  await db
    .collection<ConnectorTypeModel>(collName)
    .updateOne({ _id: new ObjectId(id) }, updates)
}

export async function deleteConnectorType(id: string): Promise<void> {
  const db = await getDB()

  await db
    .collection<ConnectorTypeModel>(collName)
    .deleteOne({ _id: new ObjectId(id) })
}
