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
  useToast,
} from '@chakra-ui/react'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'

type EventModalProps = {
  isOpen: boolean
  onClose: () => void
  initTitle: string
  date: string
  id: string
  memberId: string
  isEditing: boolean
  initDescription: string
  refresh: () => void
}

type toaststatus = 'info' | 'warning' | 'success' | 'error'

const EventModal = ({ isOpen, onClose, isEditing, initTitle = '', initDescription = '', id, date, memberId, refresh }: EventModalProps) => {
  const initialRef = React.useRef(null)
  const finalRef = React.useRef(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventId, setEventId] = useState('')
  const toast = useToast()
  const isError = description === '' || title === '' || eventDate === ''

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

  useEffect(() => {
    setTitle(initTitle)
    setDescription(initDescription)
    setEventDate(date)
    setEventId(id)
  }, [isOpen])

  const addEvent = async () => {
    setLoading(true)
    try {
      const result = await fetch(`/api/timeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          date: eventDate,
          member: memberId,
        }),
      })
      const json = await result.json()
      if ((json.status = 200)) {
        notification('Success', 'Event added successfully', 'success')
        setLoading(false)
        refresh()
        onClose()
      } else {
        notification('Error', 'Something went wrong', 'error')
        setLoading(false)
      }
    } catch (error) {
      notification('Error', 'Something went wrong', 'error')
    }
  }

  const updateEventData = async () => {
    try {
      setLoading(true)
      const result = await fetch(`/api/timeline/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          date: eventDate,
          member: memberId,
        }),
      })
      const json = await result.json()
      if ((json.status = 200)) {
        notification('Success', 'Event updated successfully', 'success')
        setLoading(false)
        refresh()
        onClose()
      } else {
        notification('Error', 'Something went wrong', 'error')
        setLoading(false)
      }
    } catch (error) {
      notification('Error', 'Something went wrong', 'error')
      setLoading(false)
    }
  }

  return (
    <>
      <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="none" backdropFilter="auto" backdropInvert="80%" backdropBlur="2px" />
        <ModalContent>
          <ModalHeader>{isEditing ? 'Update Event' : 'New Event'}</ModalHeader>
          <ModalCloseButton />
          <form>
            <ModalBody pb={6}>
              <FormControl isInvalid={isError}>
                <FormLabel>Title</FormLabel>
                <Input required ref={initialRef} placeholder="Event title" onChange={e => setTitle(e.target.value)} value={title} />
              </FormControl>

              <FormControl mt={4} isInvalid={isError}>
                <FormLabel>Description</FormLabel>
                <Input placeholder="Event description" onChange={e => setDescription(e.target.value)} value={description} />
              </FormControl>
              <FormControl mt={4} isInvalid={isError}>
                <FormLabel>Description</FormLabel>
                <Input
                  type="date"
                  _placeholder={{ fontSize: 'sm' }}
                  onChange={e => setEventDate(e.target.value)}
                  value={moment(eventDate).format('yyyy-MM-DD')}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme={isEditing ? 'blue' : 'green'}
                isDisabled={isError}
                mr={3}
                isLoading={loading}
                onClick={() => {
                  isEditing ? updateEventData() : addEvent()
                }}
              >
                {isEditing ? 'Update' : 'Create'}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}

export default EventModal
