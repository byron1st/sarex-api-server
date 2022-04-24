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

export default function CIPsViewer({
  project,
  connectorType,
  relations,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const router = useRouter()

  const [sourceIDSchemeItems, setSourceIDSchemeItems] = useState<string[]>([])
  const [targetIDSchemeItems, setTargetIDSchemeItems] = useState<string[]>([])
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

        <StringListInput
          label="Source ID Scheme"
          list={sourceIDSchemeItems}
          setList={setSourceIDSchemeItems}
        />

        <StringListInput
          label="Target ID Scheme"
          list={targetIDSchemeItems}
          setList={setTargetIDSchemeItems}
        />

        <FormControl>
          <FormLabel>Function Condition</FormLabel>
          <RadioGroup
            w="full"
            value={selectedCallIndex}
            onChange={onCallIndexChange}
          >
            <VStack w="full" overflowY="auto" px={2}>
              {calls.map((call, index) => (
                <Radio
                  value={`${index}`}
                  w="full"
                  size="sm"
                  key={`call_${index}`}
                >
                  {call.sourcelocation}.{call.targetfunc}
                </Radio>
              ))}
            </VStack>
          </RadioGroup>
        </FormControl>
      </VStack>
    </PageContainer>
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
