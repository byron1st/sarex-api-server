import {
  Box,
  Center,
  Heading,
  HStack,
  Link,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  Text,
  ModalOverlay,
  Tag,
  useDisclosure,
  Divider,
} from '@chakra-ui/react'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useMemo, useState } from 'react'
import { Exported } from 'server/model/database'
import { ProjectModel, readProject } from 'server/model/projects'
import { readRelations, RelationModel } from 'server/model/relations'

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
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [fileLocations, setFileLocations] = useState<string[]>([])
  const { isOpen, onClose, onOpen } = useDisclosure()

  const onOpenFileLocations = (locations: string[]) => {
    setFileLocations(locations)
    onOpen()
  }

  return (
    <Box>
      <Center py={4}>
        <Heading>{project.name}</Heading>
      </Center>

      <List p={4} spacing={3}>
        {relations.map((relation) => (
          <RelationItem
            relation={relation}
            onOpenFileLocations={onOpenFileLocations}
            key={relation.id}
          />
        ))}
      </List>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        autoFocus={false}
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <List spacing={2}>
              {fileLocations.map((location) => (
                <ListItem key={location}>
                  <Text fontSize="xs" fontFamily="mono">
                    {location}
                  </Text>
                  <Divider />
                </ListItem>
              ))}
            </List>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

interface RelationItemProps {
  relation: Exported<RelationModel>
  onOpenFileLocations: (locations: string[]) => void
}

function RelationItem({ relation, onOpenFileLocations }: RelationItemProps) {
  const targetFuncs: string[] = useMemo(
    () =>
      Array.from(
        relation.calls.reduce((s, call) => {
          if (call.targetfunc) {
            s.add(call.targetfunc)
          }
          return s
        }, new Set<string>()),
      ),
    [relation.calls],
  )
  const sourceLocations: string[] = useMemo(
    () =>
      Array.from(
        relation.calls.reduce((s, call) => {
          if (call.sourcelocation) {
            s.add(call.sourcelocation)
          }
          return s
        }, new Set<string>()),
      ).sort(),
    [relation.calls],
  )

  const filterLocation = (targetfunc: string): string[] => {
    const calls = relation.calls.filter(
      (call) => call.targetfunc === targetfunc,
    )

    return calls
      .filter((call) => Boolean(call.sourcelocation))
      .map((call) => call.sourcelocation as string)
      .sort()
  }

  const onClick = (targetfunc?: string) => {
    console.log('sourceLocations', relation)
    onOpenFileLocations(
      targetfunc ? filterLocation(targetfunc) : sourceLocations,
    )
  }

  return (
    <ListItem
      py={2}
      px={4}
      borderRadius={8}
      _hover={{ boxShadow: 'base', backgroundColor: 'gray.50' }}
      _active={{ backgroundColor: 'white' }}
      transition="all 0.1s linear"
      boxShadow="xs"
    >
      <HStack>
        <Tag colorScheme="blue">{relation.language}</Tag>
        <Link
          fontFamily="mono"
          fontSize="sm"
          fontWeight="bold"
          onClick={() => onClick()}
        >
          {relation.targetModule}
        </Link>
      </HStack>

      <HStack wrap="wrap">
        {targetFuncs.map((targetfunc, index) => (
          <Link
            fontSize="xs"
            fontFamily="mono"
            onClick={() => onClick(targetfunc)}
            key={`${targetfunc}.${index}`}
          >
            {targetfunc}
          </Link>
        ))}
      </HStack>
    </ListItem>
  )
}
