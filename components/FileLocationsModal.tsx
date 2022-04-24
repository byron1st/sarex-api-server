import { List, ListItem, Text, Divider } from '@chakra-ui/react'
import Modal from 'components/Modal'

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
    <Modal isOpen={isOpen} onClose={onClose}>
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
    </Modal>
  )
}
