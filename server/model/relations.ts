import { Exported, getDB, getExported } from 'server/model/database'

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
