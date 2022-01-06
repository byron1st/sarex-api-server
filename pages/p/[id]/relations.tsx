import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useState } from 'react'
import { List, useDisclosure } from '@chakra-ui/react'
import FileLocationsModal from 'components/FileLocationsModal'
import RelationItem from 'components/RelationItem'
import { Exported } from 'server/model/database'
import { ProjectModel, readProject } from 'server/model/projects'
import { readRelations, RelationModel } from 'server/model/relations'
import PageContainer from 'components/PageContainer'

export const getServerSideProps: GetServerSideProps<{
  relations: Exported<RelationModel>[]
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

  const relations = await readRelations(projectID)
  return { props: { relations, project } }
}

export default function ProjectHome({
  relations,
  project,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const [fileLocations, setFileLocations] = useState<string[]>([])
  const { isOpen, onClose, onOpen } = useDisclosure()

  const onOpenFileLocations = (locations: string[]) => {
    setFileLocations(locations)
    onOpen()
  }

  return (
    <PageContainer project={project}>
      <List p={4} spacing={3}>
        {relations.map((relation) => (
          <RelationItem
            relation={relation}
            onOpenFileLocations={onOpenFileLocations}
            key={relation.id}
          />
        ))}
      </List>

      <FileLocationsModal
        isOpen={isOpen}
        onClose={onClose}
        fileLocations={fileLocations}
      />
    </PageContainer>
  )
}
