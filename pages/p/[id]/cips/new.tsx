import {
  VStack,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  HStack,
  Input,
  Tag,
  TagCloseButton,
  Button,
  ButtonGroup,
  Text,
  Heading,
  Textarea,
  Select,
} from '@chakra-ui/react'
import PageContainer from 'components/PageContainer'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import {
  useState,
  useEffect,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  KeyboardEvent,
} from 'react'
import {
  ConnectorTypeModel,
  readConnectorType,
} from 'server/model/connector-types'
import { Exported } from 'server/model/database'
import { IDSchemeModel } from 'server/model/id-schemes'
import { ProjectModel, readProject } from 'server/model/projects'
import {
  CallModel,
  readRelationsByIDs,
  RelationModel,
} from 'server/model/relations'

export const getServerSideProps: GetServerSideProps<{
  project: Exported<ProjectModel>
  connectorType: Exported<ConnectorTypeModel>
  relations: Exported<RelationModel>[]
}> = async (ctx) => {
  const projectID = ctx.params?.id
  if (!projectID || Array.isArray(projectID)) {
    return { redirect: { destination: '/', permanent: false } }
  }

  const project = await readProject(projectID)
  if (!project) {
    return { redirect: { destination: '/', permanent: false } }
  }

  const connectorTypeID = ctx.query.connectorTypeID as string

  const connectorType = await readConnectorType(connectorTypeID)
  const relations = await readRelationsByIDs(connectorType.relationIDs)

  return { props: { project, connectorType, relations } }
}

type IDScheme = Omit<IDSchemeModel, 'projectID'>

export default function CIPsViewer({
  project,
  connectorType,
  relations,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const router = useRouter()

  const [sourceIDSchemeItems, setSourceIDSchemeItems] = useState<IDScheme[]>([])
  const [targetIDSchemeItems, setTargetIDSchemeItems] = useState<IDScheme[]>([])
  const [selectedCall, setSelectedCall] = useState<string>()
  const [selectedCallIndex, setSelectedCallIndex] = useState<string>('0')
  const [calls, setCalls] = useState<CallModel[]>([])

  useEffect(() => {
    if (connectorType) {
      setCalls(
        relations.reduce((calls: CallModel[], relation) => {
          calls.push(...relation.calls)
          return calls
        }, []),
      )
    }
  }, [connectorType, relations])

  const addSourceIDScheme = (newScheme: IDScheme): void => {
    setSourceIDSchemeItems((items) => {
      if (items.some((i) => i.name === newScheme.name)) {
        return items
      }

      return [...items, newScheme]
    })
  }

  const removeSourceIDScheme = (name: string): void => {
    setSourceIDSchemeItems((items) => {
      const index = items.findIndex((i) => i.name === name)
      if (index === -1) {
        return items
      }

      const newItems: IDScheme[] = JSON.parse(JSON.stringify(items))
      newItems.splice(index, 1)
      return newItems
    })
  }

  const addTargetIDScheme = (newScheme: IDScheme): void => {
    setTargetIDSchemeItems((items) => {
      if (items.some((i) => i.name === newScheme.name)) {
        return items
      }

      return [...items, newScheme]
    })
  }

  const removeTargetIDScheme = (name: string): void => {
    setTargetIDSchemeItems((items) => {
      const index = items.findIndex((i) => i.name === name)
      if (index === -1) {
        return items
      }

      const newItems: IDScheme[] = JSON.parse(JSON.stringify(items))
      newItems.splice(index, 1)
      return newItems
    })
  }

  const onCallIndexChange = (nextValue: string) => {
    setSelectedCallIndex(nextValue)
  }

  const createNewCIP = async () => {
    const callIndex = Number(selectedCallIndex)
    const isValid =
      sourceIDSchemeItems.length > 0 &&
      targetIDSchemeItems.length > 0 &&
      Number.isInteger(callIndex) &&
      callIndex >= 0 &&
      calls[callIndex]

    if (isValid) {
      await fetch(`/api/projects/${project.id}/cips`, {
        method: 'POST',
        body: JSON.stringify({
          connectorType: connectorType.id,
          sourceIDScheme: sourceIDSchemeItems,
          targetIDScheme: targetIDSchemeItems,
          functionCondition: JSON.stringify(calls[callIndex]),
          variableConditions: [], // unsupported
        }),
      })

      router.back()
    }
  }

  return (
    <PageContainer project={project}>
      <VStack p={4}>
        <HStack justifyContent="flex-end" w="full">
          <ButtonGroup>
            <Button onClick={router.back}>Cancel</Button>
            <Button colorScheme="blue" onClick={createNewCIP}>
              Add
            </Button>
          </ButtonGroup>
        </HStack>

        <IDSchemeInput
          label="Source ID Scheme"
          schemes={sourceIDSchemeItems}
          addScheme={addSourceIDScheme}
          removeScheme={removeSourceIDScheme}
        />

        <IDSchemeInput
          label="Target ID Scheme"
          schemes={targetIDSchemeItems}
          addScheme={addTargetIDScheme}
          removeScheme={removeTargetIDScheme}
        />

        <FormControl>
          <FormLabel>Function Condition</FormLabel>
          <Select>
            {calls.map((call, index) => (
              <option value={`${index}`} key={`call_${index}`}>
                {call.sourcelocation}.{call.targetfunc}
              </option>
            ))}
          </Select>
        </FormControl>
      </VStack>
    </PageContainer>
  )
}

interface IDSchemeInputProps {
  label: string
  schemes: IDScheme[]
  addScheme: (newScheme: IDScheme) => void
  removeScheme: (name: string) => void
}

function IDSchemeInput({
  label,
  schemes,
  addScheme,
  removeScheme,
}: IDSchemeInputProps): JSX.Element {
  const [name, setName] = useState<string>('')
  const [howTo, setHowTo] = useState<string>('')

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const onHowToChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setHowTo(e.target.value)
  }

  const add = () => {
    if (name) {
      addScheme({ name, howTo })
      setName('')
      setHowTo('')
    }
  }

  return (
    <>
      <Heading size="md">{label}</Heading>
      <FormControl isRequired>
        <FormLabel>Name</FormLabel>
        <Input value={name} onChange={onNameChange} />
      </FormControl>
      <FormControl>
        <FormLabel>How to?</FormLabel>
        <Textarea value={howTo} onChange={onHowToChange} />
      </FormControl>
      <Button onClick={add}>Add a ID Scheme</Button>

      <HStack w="full" flexWrap="wrap">
        <Text fontWeight="bold">{'<'}</Text>

        {schemes.map((item) => (
          <Tag css={{ flexShrink: 0 }} key={`sourceid_${item.name}`}>
            {item.name}
            <TagCloseButton onClick={() => removeScheme(item.name)} />
          </Tag>
        ))}

        <Text fontWeight="bold">{'>'}</Text>
      </HStack>
    </>
  )
}

interface StringListInputProps {
  label: string
  list: string[]
  setList: Dispatch<SetStateAction<string[]>>
}

function StringListInput({
  label,
  list,
  setList,
}: StringListInputProps): JSX.Element {
  const [item, setItem] = useState<string>('')

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setItem(e.target.value)
  }

  const onKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setList((list) => [...list, item])
      setItem('')
    }
  }

  const pullItem = (index: number) => {
    setList((items) => {
      const newItems = items.slice()
      newItems.splice(index, 1)
      return newItems
    })
  }

  return (
    <>
      <FormControl>
        <FormLabel>{label}</FormLabel>
        <Input value={item} onChange={onChange} onKeyUp={onKeyUp} />
      </FormControl>
      <HStack w="full" flexWrap="wrap">
        <Text fontWeight="bold">{'<'}</Text>

        {list.map((item, index) => (
          <Tag css={{ flexShrink: 0 }} key={`sourceid_${index}`}>
            {item}
            <TagCloseButton onClick={() => pullItem(index)} />
          </Tag>
        ))}

        <Text fontWeight="bold">{'>'}</Text>
      </HStack>
    </>
  )
}
