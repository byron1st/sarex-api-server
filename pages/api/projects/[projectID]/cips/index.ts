import { NextApiRequest, NextApiResponse } from 'next'
import { CIPModel, createCIP, readCIPsByType } from 'server/model/cips'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const projectID = req.query['projectID'] as string

  try {
    if (req.method === 'POST') {
      const projectID = req.query.projectID as string
      const body = JSON.parse(req.body) as Omit<CIPModel, 'projectID'>
      if (
        !projectID ||
        !body.connectorType ||
        !body.sourceIDScheme ||
        body.sourceIDScheme.length <= 0 ||
        !body.targetIDScheme ||
        body.targetIDScheme.length <= 0 ||
        !body.functionCondition
      ) {
        res.status(400).json({ error: 'wrong request parameter' })
        return
      }

      await createCIP({ ...body, projectID })

      res.status(200).json({ success: true })
    } else if (req.method === 'GET') {
      const connectorType = req.query['type'] as string | undefined
      if (!connectorType) {
        res.status(400).json({ error: 'no connector type specified' })
        return
      }

      const cips = await readCIPsByType(projectID, connectorType)

      res.status(200).json(cips)
    }
  } catch (err) {
    console.error(err)

    const caughtErr = err instanceof Error ? err : new Error('unknown error')
    res.status(500).json({ error: caughtErr.message })
  }
}
