import { ObjectId } from 'mongodb'
import { Exported, getDB, getExported } from 'server/model/database'

export interface ProjectModel {
  name: string
}

const collName = 'projects'

export async function createNewProject(
  name: string,
): Promise<Exported<ProjectModel>> {
  const db = await getDB()
  const newProject: ProjectModel = { name }
  const result = await db
    .collection<ProjectModel>(collName)
    .insertOne(newProject)

  return getExported<ProjectModel>(newProject, result.insertedId.toString())
}

export async function readProjects(): Promise<Exported<ProjectModel>[]> {
  const db = await getDB()

  const projects = await db
    .collection<ProjectModel>(collName)
    .find({})
    .toArray()

  return projects.map((project) => getExported<ProjectModel>(project))
}

export async function readProject(
  id: string,
): Promise<Exported<ProjectModel> | undefined> {
  const db = await getDB()

  const project = await db
    .collection<ProjectModel>(collName)
    .findOne({ _id: new ObjectId(id) })
  if (project === null) {
    return undefined
  }

  return getExported<ProjectModel>(project, project._id.toString())
}
