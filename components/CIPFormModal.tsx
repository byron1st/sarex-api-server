import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Tag,
  TagCloseButton,
  Text,
  VStack,
} from '@chakra-ui/react'
import { ConnectorTypeWithRelations } from 'pages/api/projects/[projectID]/connectortypes'
import {
  useState,
  KeyboardEvent,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react'
import { CIPModel } from 'server/model/cips'
import { Exported } from 'server/model/database'
import { CallModel } from 'server/model/relations'

interface CIPFormModalProps {
  connectorType: ConnectorTypeWithRelations
  isOpen: boolean
  onClose: () => void
  cip?: Exported<CIPModel>
}

export default function CIPFormModal({
  connectorType,
  isOpen,
  onClose,
  cip,
}: CIPFormModalProps): JSX.Element {
  const [sourceIDSchemeItems, setSourceIDSchemeItems] = useState<string[]>([])
  const [targetIDSchemeItems, setTargetIDSchemeItems] = useState<string[]>([])
  const [selectedCallIndex, setSelectedCallIndex] = useState<string>('0')
  const [calls, setCalls] = useState<CallModel[]>([])

  useEffect(() => {
    if (connectorType) {
      setCalls(
        connectorType.relations.reduce((calls: CallModel[], relation) => {
          calls.push(...relation.calls)
          return calls
        }, []),
      )
    }
  }, [connectorType])

  const onCallIndexChange = (nextValue: string) => {
    setSelectedCallIndex(nextValue)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      autoFocus={false}
      isCentered
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text>
            {cip
              ? `Edit CIP (${cip.id})`
              : `New CIP for \"${connectorType.name}\"`}
          </Text>
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          <VStack>
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
                <VStack w="full" maxH={200} overflowY="auto" px={2}>
                  {calls.map((call, index) => (
                    <Radio
                      value={`${index}`}
                      w="full"
                      size="sm"
                      key={`call_${index}`}
                    >
                      {call.sourcelocation}
                    </Radio>
                  ))}
                </VStack>
              </RadioGroup>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <ButtonGroup>
            <Button>Cancel</Button>
            <Button colorScheme="blue">Add</Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
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
        {list.map((item, index) => (
          <Tag css={{ flexShrink: 0 }} key={`sourceid_${index}`}>
            {item}
            <TagCloseButton onClick={() => pullItem(index)} />
          </Tag>
        ))}
      </HStack>
    </>
  )
}
