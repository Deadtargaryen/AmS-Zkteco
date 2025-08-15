import { Button, FormControl, FormLabel, HStack, Input, useToast } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { FaSave } from 'react-icons/fa'

const ChangePasswordComponent = () => {
  const oldPasswordRef = useRef<HTMLInputElement>()
  const newPasswordRef = useRef<HTMLInputElement>()
  const confirmPasswordRef = useRef<HTMLInputElement>()
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  function cancel(): void {
    reset()
  }
  const reset = () => {
    oldPasswordRef.current.value = ''
    newPasswordRef.current.value = ''
    confirmPasswordRef.current.value = ''
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    const oldPassword = oldPasswordRef.current?.value
    const newPassword = newPasswordRef.current?.value
    const confirmPassword = confirmPasswordRef.current?.value

    try {
      const res = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong!')
      }

      setLoading(false)
      reset()
      toast({
        title: 'Password changed successfully',
        position: 'top-right',
        isClosable: true,
        status: 'success',
      })
    } catch (err) {
      setLoading(false)
      toast({
        title: 'Error',
        description: err.message,
        position: 'top-right',
        isClosable: true,
        status: 'error',
      })
    }
  }

  return (
    <form autoComplete="off" onSubmit={handleSubmit}>
      <FormControl py='0.5rem'>
        <FormLabel fontSize="sm" fontWeight="semibold">
          Old Password
        </FormLabel>
        <Input autoComplete="off" type="text" placeholder="Enter Old Password" ref={oldPasswordRef} />
      </FormControl>
      <FormControl py='0.5rem'>
        <FormLabel fontSize="sm" fontWeight="semibold">
          New Password
        </FormLabel>
        <Input autoComplete="off" type="text" placeholder="Enter New Password" ref={newPasswordRef} />
      </FormControl>
      <FormControl>
        <FormLabel fontSize="sm" fontWeight="semibold">
          Confirm Password
        </FormLabel>
        <Input autoComplete="off" type="text" placeholder="Confirm New Password" ref={confirmPasswordRef} />
      </FormControl>

      <HStack mt="1rem">
        <Button leftIcon={<FaSave />} colorScheme="green" size="sm" type="submit" isLoading={loading}>
          Save
        </Button>
        <Button colorScheme="red" size="sm" onClick={() => cancel()}>
          Cancel
        </Button>
      </HStack>
    </form>
  )
}

export default ChangePasswordComponent
