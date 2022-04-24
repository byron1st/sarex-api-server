import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useState } from 'react'
import { Center, List, useDisclosure } from '@chakra-ui/react'
import FileLocationsModal from 'components/FileLocationsModal'
import RelationItem from 'components/RelationItem'
import { Exported } from 'server/model/database'
import { ProjectModel, readProject } from 'server/model/projects'
import {
  readRelations,
  RelationModel,
  SupportedLang,
} from 'server/model/relations'
import PageContainer from 'components/PageContainer'
import { ConnectorTypeModel } from 'server/model/connector-types'
import ConnectorTypeFormModal from 'components/ConnectorTypeFormModal'
import useSWR from 'swr'

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

export default function RelationsViewer({
  relations,
  project,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const { data: types, mutate } = useSWR<Exported<ConnectorTypeModel>[], Error>(
    `/api/projects/${project.id}/connectortypes`,
  )

  const [fileLocations, setFileLocations] = useState<string[]>([])
  const [targetModule, setTargetModule] = useState<string | null>(null)
  const [language, setLanguage] = useState<SupportedLang | null>(null)
  const {
    isOpen: isFileLocationModalOpen,
    onClose: onFileLocationModalClose,
    onOpen: onFileLocationModalOpen,
  } = useDisclosure()
  const {
    isOpen: isConnectionTypeFormModalOpen,
    onClose: onConnectionTypeFormModalClose,
    onOpen: onConnectionTypeFormModalOpen,
  } = useDisclosure()

  const onOpenFileLocations = (locations: string[]) => {
    setFileLocations(locations)
    onFileLocationModalOpen()
  }

  const onOpenConnectionTypeForm = (relation: Exported<RelationModel>) => {
    setTargetModule(relation.targetModule)
    setLanguage(relation.language)
    onConnectionTypeFormModalOpen()
  }

  const reloadTypes = async () => {
    await mutate()
  }

  return (
    <PageContainer project={project}>
      <Center w="100%">
        <List maxW={800} p={4} spacing={3}>
          {relations.map((relation) => (
            <RelationItem
              relation={relation}
              onOpenFileLocations={onOpenFileLocations}
              onOpenConnectionTypeForm={onOpenConnectionTypeForm}
              key={relation.id}
            />
          ))}
        </List>
      </Center>

      <FileLocationsModal
        isOpen={isFileLocationModalOpen}
        onClose={onFileLocationModalClose}
        fileLocations={fileLocations}
      />
      <ConnectorTypeFormModal
        isOpen={isConnectionTypeFormModalOpen}
        onClose={onConnectionTypeFormModalClose}
        reloadTypes={reloadTypes}
        types={types ? types : []}
        targetModule={targetModule}
        language={language}
        projectID={project.id}
      />
    </PageContainer>
  )
}
