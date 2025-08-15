import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from '@chakra-ui/react'
import { useRef } from 'react'

type AlertProps = {
  text: string
  affirm: () => void
  title: string
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  loading?: boolean
}

const Alert = ({ isOpen, onOpen, onClose, text, affirm, title, loading }: AlertProps) => {
  const cancelRef = useRef()
  return (
    <>
      <AlertDialog leastDestructiveRef={cancelRef} onClose={onClose} isOpen={isOpen} isCentered>
        <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(10px) hue-rotate(90deg)" />

        <AlertDialogContent>
          <AlertDialogHeader>{title}</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>{text}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} disabled={loading}>
              No
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              isLoading={loading}
              onClick={() => {
                affirm()
              }}
            >
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default Alert
