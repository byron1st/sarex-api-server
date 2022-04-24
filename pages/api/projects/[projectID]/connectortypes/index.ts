import { NextApiRequest, NextApiResponse } from 'next'
import {
  ConnectorTypeModel,
  createConnectorType,
  readConnectorTypes,
} from 'server/model/connector-types'
import { Exported } from 'server/model/database'
import {
  readRelationByTargetModule,
  readRelationsByIDs,
  RelationModel,
  SupportedLang,
} from 'server/model/relations'

export interface CreateConnectorTypeReq {
  language: SupportedLang
  targetModule: string
  name: string
}

export type ConnectorTypeWithRelations = Exported<ConnectorTypeModel> & {
  relations: Exported<RelationModel>[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const projectID = req.query['projectID'] as string

  try {
    if (req.method === 'POST') {
      await create(req, res, projectID)
    } else if (req.method === 'GET') {
      const types = await readConnectorTypes(projectID)

      const result: ConnectorTypeWithRelations[] = []
      for (const connectorType of types) {
        const relationIDs = connectorType.relationIDs
        const relations = await readRelationsByIDs(relationIDs)

        result.push({ ...connectorType, relations })
      }

      res.status(200).json(result)
    }
  } catch (err) {
    console.error(err)

    const caughtErr = err instanceof Error ? err : new Error('unknown error')
    res.status(500).json({ error: caughtErr.message })
  }
}

async function create(
  req: NextApiRequest,
  res: NextApiResponse,
  projectID: string,
): Promise<void> {
  const { targetModule, name, language } = req.body as CreateConnectorTypeReq
  const relation = await readRelationByTargetModule(
    projectID,
    language,
    targetModule,
  )
  if (relation === null) {
    res.status(500).json({ error: 'no such relation' })
    return
  }

  await createConnectorType(projectID, name, relation.id)
  res.status(200).json({ success: true })
}
