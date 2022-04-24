import { Box, Button, Center, Text, VStack } from '@chakra-ui/react'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import { Exported } from 'server/model/database'
import { ProjectModel, readProjects } from 'server/model/projects'

export const getServerSideProps: GetServerSideProps<{
  projects: Exported<ProjectModel>[]
}> = async () => {
  const projects = await readProjects()

  return { props: { projects } }
}

export default function Home({
  projects,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()

  const moveToProject = (id: string) => {
    router.push(`/p/${id}/relations`)
  }

  return (
    <Box w="100vw" h="100vh">
      <Center w="100%" h="100%">
        <VStack gap={2} minW={100}>
          <Text>Select a project</Text>
          <VStack gap={1} w={300}>
            {projects.map((project) => (
              <Button
                isFullWidth
                onClick={() => moveToProject(project.id)}
                key={project.id}
              >
                {project.name}
              </Button>
            ))}
          </VStack>
        </VStack>
      </Center>
    </Box>
  )
}
