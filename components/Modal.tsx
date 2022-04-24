import { ReactNode } from 'react'
import {
  Modal as ChakraModal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  ModalCloseButton,
  ModalHeader,
} from '@chakra-ui/react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  size?: 'xs' | 'sm' | 'md' | 'xl'
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  size,
}: ModalProps): JSX.Element {
  return (
    <ChakraModal
      isOpen={isOpen}
      onClose={onClose}
      autoFocus={false}
      isCentered
      scrollBehavior="inside"
      size={size ? size : 'xl'}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {title}
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </ChakraModal>
  )
}
