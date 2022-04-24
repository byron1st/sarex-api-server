import { Box } from '@chakra-ui/react'
import Header from 'components/Header'
import { ReactNode } from 'react'
import { Exported } from 'server/model/database'
import { ProjectModel } from 'server/model/projects'

interface PageContainerProps {
  project: Exported<ProjectModel>
  children: ReactNode
}

export default function PageContainer({
  project,
  children,
}: PageContainerProps): JSX.Element {
  return (
    <Box>
      <Header project={project} />

      {children}
    </Box>
  )
}
