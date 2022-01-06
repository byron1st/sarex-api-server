import {
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  Text,
  ModalOverlay,
  Divider,
} from '@chakra-ui/react'

interface SourceLocationModalProps {
  isOpen: boolean
  onClose: () => void
  fileLocations: string[]
}

export default function FileLocationsModal({
  isOpen,
  onClose,
  fileLocations,
}: SourceLocationModalProps): JSX.Element {
  return (
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
  )
}
