import { AddIcon } from '@chakra-ui/icons'
import {
  HStack,
  IconButton,
  Link,
  ListItem,
  Spacer,
  Tag,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { Exported } from 'server/model/database'
import { RelationModel } from 'server/model/relations'

interface RelationItemProps {
  relation: Exported<RelationModel>
  onOpenFileLocations: (locations: string[]) => void
  onOpenConnectionTypeForm: (relation: Exported<RelationModel>) => void
}

export default function RelationItem({
  relation,
  onOpenFileLocations,
  onOpenConnectionTypeForm,
}: RelationItemProps): JSX.Element {
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
    onOpenFileLocations(
      targetfunc ? filterLocation(targetfunc) : sourceLocations,
    )
  }

  const addConnectorType = () => {
    onOpenConnectionTypeForm(relation)
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

        <Spacer />

        <IconButton
          aria-label="Add a connector type"
          variant="ghost"
          size="sm"
          onClick={addConnectorType}
          icon={<AddIcon w={3} h={3} />}
        />
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
