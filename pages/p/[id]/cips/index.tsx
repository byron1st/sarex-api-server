import {
  Button,
  Center,
  CircularProgress,
  HStack,
  List,
  ListItem,
  Spacer,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import PageContainer from 'components/PageContainer'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import { ConnectorTypeWithRelations } from 'pages/api/projects/[projectID]/connectortypes'
import { CIPModel } from 'server/model/cips'
import { Exported } from 'server/model/database'
import { ProjectModel, readProject } from 'server/model/projects'
import useSWR from 'swr'

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

export default function CIPsViewer({
  project,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const {
    data: connectorTypes,
    mutate,
    isValidating,
  } = useSWR<ConnectorTypeWithRelations[], Error>(
    `/api/projects/${project.id}/connectortypes`,
  )

  return (
    <PageContainer project={project}>
      <Center w="100%">
        <List maxW={800} p={4} spacing={3} w="full">
          {isValidating ? (
            <CircularProgress />
          ) : (
            connectorTypes?.map((connectorType) => (
              <ConnectorTypeItem
                connectorType={connectorType}
                projectID={project.id}
                key={connectorType.id}
              />
            ))
          )}
        </List>
      </Center>
    </PageContainer>
  )
}

interface ConnectorTypeItemProps {
  connectorType: ConnectorTypeWithRelations
  projectID: string
}

function ConnectorTypeItem({
  connectorType,
  projectID,
}: ConnectorTypeItemProps): JSX.Element {
  const router = useRouter()

  const {
    data: cips,
    mutate,
    isValidating,
  } = useSWR<Exported<CIPModel>[], Error>(
    `/api/projects/${projectID}/cips?type=${connectorType}`,
  )

  const { isOpen, onClose, onOpen } = useDisclosure()

  const moveToNew = async () => {
    await router.push(
      `/p/${projectID}/cips/new?connectorTypeID=${connectorType.id}`,
    )
  }

  console.log(cips)

  return (
    <ListItem py={2} px={4} borderRadius={8} boxShadow="xs" w="full">
      <VStack w="full">
        <HStack w="full">
          <Text>{connectorType.name}</Text>
          <Spacer />
          <Button onClick={moveToNew}>Add a new CIP</Button>
          {/* <CIPFormModal
            isOpen={isOpen}
            onClose={onClose}
            connectorType={connectorType}
          /> */}
        </HStack>
        <List>
          {isValidating ? (
            <CircularProgress />
          ) : (
            cips?.map((cip) => <ListItem key={cip.id}>{cip.id}</ListItem>)
          )}
        </List>
      </VStack>
    </ListItem>
  )
}
