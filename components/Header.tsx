import { ButtonGroup, Center, Heading, HStack, Spacer } from '@chakra-ui/react'
import MenuButton, { MenuType } from 'components/MenuButton'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Exported } from 'server/model/database'
import { ProjectModel } from 'server/model/projects'

interface HeaderProps {
  project: Exported<ProjectModel>
}

export default function Header({ project }: HeaderProps): JSX.Element {
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
    <HStack px={2}>
      <Center py={4}>
        <Heading size="md">{project.name}</Heading>
      </Center>

      <Spacer />

      <Center>
        <ButtonGroup variant="link">
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
    </HStack>
  )
}
