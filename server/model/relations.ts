import { ObjectId } from 'mongodb'
import { Exported, getDB, getExported } from 'server/model/database'

export type SupportedLang = 'Go' | 'JavaScript'

export interface RelationModel {
  projectID: string
  targetModule: string
  calls: CallModel[]
  language: 'Go' | 'JavaScript'
}

export interface CallModel {
  sourcemodule: string
  sourcelocation?: string
  targetfunc?: string
}

const collName = 'relations'

export async function readRelationByTargetModule(
  projectID: string,
  language: SupportedLang,
  targetModule: string,
): Promise<Exported<RelationModel> | null> {
  const db = await getDB()

  const relation = await db
    .collection<RelationModel>(collName)
    .findOne({ projectID, targetModule, language })

  return relation === null ? null : getExported<RelationModel>(relation)
}

export async function readRelations(
  projectID: string,
): Promise<Exported<RelationModel>[]> {
  const db = await getDB()

  const relations = await db
    .collection<RelationModel>(collName)
    .find({ projectID })
    .sort({ language: 1, targetModule: 1 })
    .toArray()

  return relations.map((relation) => getExported<RelationModel>(relation))
}

export async function readRelationsByIDs(
  idsStr: string[],
): Promise<Exported<RelationModel>[]> {
  const db = await getDB()

  const ids = idsStr.map((idStr) => new ObjectId(idStr))

  const relations = await db
    .collection<RelationModel>(collName)
    .find({ _id: { $in: ids } })
    .toArray()

  return relations.map((relation) => getExported<RelationModel>(relation))
}
