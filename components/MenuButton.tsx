import { Button } from '@chakra-ui/react'

export type MenuType = 'relations' | 'cips' | 'view'

interface MenuButtonProps {
  title: string
  value: MenuType
  current: MenuType | null
  moveTo: (page: MenuType) => void
}

export default function MenuButton({
  title,
  value,
  current,
  moveTo,
}: MenuButtonProps): JSX.Element {
  const onClick = (): void => {
    moveTo(value)
  }

  return (
    <Button
      colorScheme={current === value ? 'blue' : undefined}
      onClick={onClick}
    >
      {title}
    </Button>
  )
}
