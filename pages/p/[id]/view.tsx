import PageContainer from 'components/PageContainer'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { Exported } from 'server/model/database'
import { ProjectModel, readProject } from 'server/model/projects'

export const getServerSideProps: GetServerSideProps<{
  project: Exported<ProjectModel>
}> = async (ctx) => {
  const projectID = ctx.params?.id
  if (!projectID || Array.isArray(projectID)) {
    return { redirect: { destination: '/', permanent: false } }
  }

  const project = await readProject(projectID)
  if (!project) {
    return { redirect: { destination: '/', permanent: false } }
  }

  return { props: { project } }
}

export default function ExecutionView({
  project,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <PageContainer project={project}>
      <div>view</div>
    </PageContainer>
  )
}
