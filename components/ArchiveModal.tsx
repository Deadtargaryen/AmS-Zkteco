import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { useArchiveMemberMutation } from '../redux/store/api'
import { useRouter } from 'next/router'

type EventModalProps = {
  isOpen: boolean
  onClose: () => void
  id: string
}

type toaststatus = 'info' | 'warning' | 'success' | 'error'

const ArchiveModal = ({ isOpen, onClose, id }: EventModalProps) => {
  const initialRef = React.useRef(null)
  const finalRef = React.useRef(null)
  const [reason, setReason] = useState('')
  const [disfellowshipDate, setDate] = useState('')
  const toast = useToast()
  const [newDisfellowship, { isLoading, isSuccess, isError: deleteError, error }] = useArchiveMemberMutation()
  const isError = disfellowshipDate === '' || reason === ''
  const router = useRouter()

  const notification = (title: string, description: string, status: toaststatus) => {
    toast({
      title: title,
      description: description,
      status: status,
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    })
  }

  const handleSubmit = () => {
    const body = { reason, disfellowshipDate: new Date(disfellowshipDate) }
    newDisfellowship({ id, body }).then(() => {
      onClose()
      setTimeout(() => {
        router.replace('/members')
      }, 2000)
    })
  }

  useEffect(() => {
    
    if (isSuccess) {
      notification('Success', 'Profile has been Archived', 'success')
    } else if (deleteError) {
      const { data } = error as { data: { error: string } }
      notification('Error', `${data.error}`, 'error')
    }
  }, [isSuccess, deleteError])

  return (
    <>
      <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="none" backdropFilter="auto" backdropInvert="40%" backdropBlur="2px" />
        <ModalContent>
          <ModalHeader>New Disfellowship</ModalHeader>
          <ModalCloseButton />
          <form>
            <ModalBody pb={6}>
              <FormControl isInvalid={isError}>
                <FormLabel>Grounds of Disfellowship</FormLabel>
                <Textarea required ref={initialRef} placeholder="Enter reasons" onChange={e => setReason(e.target.value)} value={reason} />
              </FormControl>
              <FormControl mt={4} isInvalid={isError}>
                <FormLabel>Disfellowship Date</FormLabel>
                <Input type="date" _placeholder={{ fontSize: 'sm' }} onChange={e => setDate(e.target.value)} value={disfellowshipDate} />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" isDisabled={isError} mr={3} isLoading={isLoading} onClick={handleSubmit}>
                Submit
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ArchiveModal
