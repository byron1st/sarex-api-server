import { Box, ButtonGroup, Center, Heading } from '@chakra-ui/react'
import MenuButton, { MenuType } from 'components/MenuButton'
import { useRouter } from 'next/router'
import { ReactNode, useEffect, useState } from 'react'
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
  const router = useRouter()

  const [current, setCurrent] = useState<MenuType | null>(null)

  useEffect(() => {
    if (router.isReady) {
      if (router.pathname.includes('relations')) {
        setCurrent('relations')
      } else if (router.pathname.includes('cips')) {
        setCurrent('cips')
      } else if (router.pathname.includes('view')) {
        setCurrent('view')
      }
    }
  }, [router.isReady, router.pathname])

  const moveTo = (page: MenuType): void => {
    router.push(`/p/${project.id}/${page}`)
  }

  return (
    <Box>
      <Center py={4}>
        <Heading>{project.name}</Heading>
      </Center>

      <Center>
        <ButtonGroup isAttached>
          <MenuButton
            title="Dependency Relations"
            value="relations"
            current={current}
            moveTo={moveTo}
          />
          <MenuButton
            title="CIPs"
            value="cips"
            current={current}
            moveTo={moveTo}
          />
          <MenuButton
            title="View"
            value="view"
            current={current}
            moveTo={moveTo}
          />
        </ButtonGroup>
      </Center>

      {children}
    </Box>
  )
}
