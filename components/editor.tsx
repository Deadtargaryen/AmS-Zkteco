import {
  Avatar,
  Box,
  Button,
  Center,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  SimpleGrid,
  Stack,
  Textarea,
  useToast,
} from '@chakra-ui/react'
import { Gender, MarritalStatus, Status } from '@prisma/client'
import validator from 'validator'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import moment from 'moment'
import { useAddMemberMutation, useRestoreMemberMutation, useUpdateMemberMutation } from '../redux/store/api'

type EditorProps = {
  firstname: string
  lastname: string
  middlename: string
  email: string
  contactNo: string
  alternateContact: string
  address: string
  status: Status
  zone: zone | null
  cardNo: number
  maritalStatus: MarritalStatus
  occupation: string
  placeOfBirth: string
  gender: Gender
  dateOfBaptism?: string
  dateOfMembership?: string
  spouse?: string
  avatarUrl?: string
  isEditing: boolean
  id?: string
  isRestore: boolean
  nextOfKin: string
  kinContact: string
  businessAddress: string
}

type zone = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
type toaststatus = 'info' | 'warning' | 'success' | 'error'

const Editor = (props: EditorProps) => {
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isError, setIsError] = useState(false)
  const [id, setId] = useState(null)
  const [contactError, setContactError] = useState({
    contactNo: false,
    alternateContact: false,
    kinContact: false,
  })
  const router = useRouter()
  const [form, setForm] = useState({
    firstname: null,
    email: null,
    contactNo: '',
    alternateContact: '',
    address: null,
    middlename: null,
    lastname: null,
    cardNo: null,
    status: 'ACTIVE',
    zone: null,
    maritalStatus: null,
    occupation: null,
    placeOfBirth: null,
    dateOfBaptism: null,
    dateOfMembership: null,
    spouse: null,
    gender: null,
    avatarUrl: null,
    nextOfKin: null,
    kinContact: null,
    businessAddress: null,
  })

  const validatePhoneNumber = input => {
    // Define a regular expression pattern for a valid phone number.
    // This pattern allows for 10 or more digits and may include spaces, hyphens, or parentheses.
    const phoneNumberPattern = /^\+?[0-9\s\-()]+$/

    // Remove any spaces, hyphens, or parentheses from the input
    const cleanedInput = input.replace(/[\s\-()]/g, '')

    // Check if the cleaned input matches the phone number pattern
    return phoneNumberPattern.test(cleanedInput) && cleanedInput.length >= 10
  }

  const checkPhoneNumber = e => {
    const error = form[e.target.name] === '' || !validatePhoneNumber(form[e.target.name])
    setContactError(prev => ({ ...prev, [e.target.name]: error }))
  }

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

  const [addNew, { isLoading, isError: isSubmitError, error, isSuccess }] = useAddMemberMutation()
  const [updateMember, { isLoading: updateLoading, isError: isUpdateError, error: updateError, isSuccess: isUpdateSuccess }] =
    useUpdateMemberMutation()
  const [restoreMember, { isLoading: restoreLoading, data: restoreData, isSuccess: restoreSuccess, isError: restoreIsError, error: restoreError }] =
    useRestoreMemberMutation()

  const handleSubmit = e => {
    e.preventDefault()
    addNew(form)
  }

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'New Member Added',
        position: 'top-right',
        isClosable: true,
        status: 'success',
      })
      resetFields()
    } else if (isSubmitError) {
      const { data } = error as { data: { error: string } }
      toast({
        title: `${data.error}`,
        position: 'top-right',
        isClosable: true,
        status: 'error',
      })
    }
  }, [isSuccess, isSubmitError])

  const handleUpdate = e => {
    e.preventDefault()
    updateMember({ id, body: { ...form, id } })
  }

  const handleRestore = e => {
    e.preventDefault()
    restoreMember({ id, body: { ...form, id } })
  }

  useEffect(() => {
    if (isUpdateSuccess) {
      notification('Success', 'Member updated successfully', 'success')
      setTimeout(() => {
        router.push(`/profile/${id}?isProfile=${true}`)
      }, 2000)
    } else if (isUpdateError) {
      const { data } = updateError as { data: { error: string } }
      notification('Error', `${data.error}`, 'error')
    }
  }, [isUpdateError, isUpdateSuccess])

  useEffect(() => {
    if (restoreSuccess) {
      notification('Success', `${restoreData.message}`, 'success')
      setTimeout(() => {
        router.push({ pathname: `/profile/${restoreData.transaction[0].id}`, query: { isProfile: 'true' } })
      }, 2000)
    } else if (restoreIsError) {
      const { data } = restoreError as { data: { error: string } }
      notification('Error', `${data.error}`, 'error')
    }
  }, [restoreError, restoreSuccess])

  const cancel = () => {
    if (isEditing) {
      router.replace(`/profile/${props.id}?isProfile=${true}`)
    } else if (props.isRestore) {
      router.replace(`/profile/${props.id}?isProfile=${false}`)
    }
  }

  const resetFields = () => {
    setForm({
      firstname: '',
      email: '',
      contactNo: '',
      alternateContact: '',
      address: '',
      middlename: '',
      lastname: '',
      cardNo: '',
      status: '',
      zone: '',
      maritalStatus: '',
      occupation: '',
      placeOfBirth: null,
      dateOfBaptism: null,
      dateOfMembership: null,
      spouse: '',
      gender: '',
      avatarUrl: null,
      nextOfKin: '',
      kinContact: '',
      businessAddress: '',
    })
    setContactError({ alternateContact: false, contactNo: false, kinContact: false })
  }
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      firstname: props.firstname,
      middlename: props.middlename,
      email: props.email,
      contactNo: props.contactNo,
      alternateContact: props.alternateContact,
      address: props.address,
      cardNo: props.cardNo,
      status: props.status,
      zone: props.zone,
      gender: props.gender,
      maritalStatus: props.maritalStatus,
      occupation: props.occupation,
      lastname: props.lastname,
      placeOfBirth: props.placeOfBirth,
      dateOfBaptism: props.dateOfBaptism || null,
      dateOfMembership: props.dateOfMembership || null,
      spouse: props.spouse,
      avatarUrl: props.avatarUrl,
      nextOfKin: props.nextOfKin,
      kinContact: props.kinContact,
      businessAddress: props.businessAddress,
    }))
    setId(props.id)
    setIsEditing(props.isEditing)
  }, [])

  const handleInputChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleOnChange = e => {
    const reader = new FileReader()
    reader.onload = onLoadEvent => {
      setForm(prev => ({ ...prev, avatarUrl: onLoadEvent.target.result }))
    }
    const selectedFile = e.target.files[0]
    if (selectedFile?.size > 300000 || (selectedFile?.type !== 'image/jpeg' && selectedFile?.type !== 'image/png')) {
      toast({
        title: `File size is greater than 200kb or file type is not supported`,
        position: 'top-right',
        isClosable: true,
        status: 'error',
      })
      reader.abort()
      return
    }
    reader.readAsDataURL(e.target.files[0])
  }

  const handleDeletePicture = () => {
    setForm(prev => ({ ...prev, avatarUrl: '' }))
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4} bg="white" rounded="sm" shadow="md" w="70%" m="auto" p="1.5rem" color="blackAlpha.700">
          <Center mb="2rem">
            <Menu placement="left-start">
              <MenuButton as={Avatar} size="2xl" _hover={{ opacity: 0.8 }} cursor="pointer" src={form.avatarUrl}></MenuButton>
              <MenuList>
                <MenuItem>
                  <label htmlFor="avatarUrl">{form.avatarUrl ? 'Change picture' : 'Add picture'}</label>
                  <Input type="file" accept="image/*" onChange={handleOnChange} id="avatarUrl" hidden />
                </MenuItem>
                <MenuItem onClick={handleDeletePicture}>Delete picture</MenuItem>
              </MenuList>
            </Menu>
          </Center>
          <SimpleGrid minChildWidth="100px" spacing="5">
            <FormControl isInvalid={isError}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                First name
              </FormLabel>
              <Input
                name="firstname"
                type="text"
                required
                placeholder="Enter first name"
                _placeholder={{ fontSize: 'sm' }}
                onChange={handleInputChange}
                value={form.firstname}
              />
              {isError && <FormErrorMessage>Field is required.</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={isError}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Middle name
              </FormLabel>
              <Input
                name="middlename"
                type="text"
                required
                placeholder="Enter middle name"
                _placeholder={{ fontSize: 'sm' }}
                onChange={handleInputChange}
                value={form.middlename}
              />
              {isError && <FormErrorMessage>Field is required.</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={isError}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Last name
              </FormLabel>
              <Input
                name="lastname"
                type="text"
                required
                placeholder="Enter last name"
                _placeholder={{ fontSize: 'sm' }}
                onChange={handleInputChange}
                value={form.lastname}
              />
              {isError && <FormErrorMessage>Field is required.</FormErrorMessage>}
            </FormControl>
          </SimpleGrid>
          <SimpleGrid minChildWidth="100px" spacing="4">
            <FormControl isInvalid={isError}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Card Number
              </FormLabel>
              <Input
                name="cardNo"
                type="number"
                isRequired
                placeholder="Registration number"
                _placeholder={{ fontSize: 'sm' }}
                onChange={handleInputChange}
                value={form.cardNo}
                min={1}
              />
              {isError && <FormErrorMessage>Field is required.</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={isError}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Email Address
              </FormLabel>
              <Input
                name="email"
                type="email"
                placeholder="Enter email"
                _placeholder={{ fontSize: 'sm' }}
                onChange={handleInputChange}
                value={form.email}
              />
            </FormControl>
          </SimpleGrid>
          <SimpleGrid spacing="4" columns={2}>
            <FormControl isInvalid={contactError.contactNo}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Phone Number
              </FormLabel>
              <Input
                name="contactNo"
                type="tel"
                required
                placeholder="Contact number"
                _placeholder={{ fontSize: 'sm' }}
                onChange={e => {
                  handleInputChange(e)
                }}
                onBlur={e => checkPhoneNumber(e)}
                value={form.contactNo}
              />
              {contactError.contactNo && <FormErrorMessage>Phone number must be a valid phone number.</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={contactError.alternateContact}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Alternate Number
              </FormLabel>
              <Input
                name="alternateContact"
                type="tel"
                placeholder="Alternate number"
                _placeholder={{ fontSize: 'sm' }}
                onChange={e => {
                  handleInputChange(e)
                }}
                onBlur={e => checkPhoneNumber(e)}
                value={form.alternateContact}
              />
              {contactError.alternateContact && <FormErrorMessage>Alternate number must be a valid phone number.</FormErrorMessage>}
            </FormControl>
          </SimpleGrid>
          <SimpleGrid spacing="4" columns={2}>
            <FormControl isInvalid={isError}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Next Of Kin
              </FormLabel>
              <Input
                name="nextOfKin"
                type="text"
                required
                placeholder="Next of Kin"
                _placeholder={{ fontSize: 'sm' }}
                onChange={e => {
                  handleInputChange(e)
                }}
                value={form.nextOfKin}
              />
              {isError && <FormErrorMessage>Field is required.</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={contactError.alternateContact}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Next of Kin Contact
              </FormLabel>
              <Input
                name="kinContact"
                type="tel"
                placeholder="Next of kin phone number"
                _placeholder={{ fontSize: 'sm' }}
                onChange={e => {
                  handleInputChange(e)
                }}
                onBlur={e => checkPhoneNumber(e)}
                value={form.kinContact}
              />
              {contactError.kinContact && <FormErrorMessage>Number must be a valid phone number.</FormErrorMessage>}
            </FormControl>
          </SimpleGrid>
          <FormControl isInvalid={isError}>
            <FormLabel fontSize="sm" fontWeight="semibold">
              Residential Address
            </FormLabel>
            <Textarea
              name="address"
              placeholder="Current place of residence"
              required
              _placeholder={{ fontSize: 'sm' }}
              onChange={handleInputChange}
              value={form.address}
            ></Textarea>
          </FormControl>
          <FormControl isInvalid={isError}>
            <FormLabel fontSize="sm" fontWeight="semibold">
              Business Address
            </FormLabel>
            <Textarea
              name="businessAddress"
              placeholder="Primary Business Address"
              _placeholder={{ fontSize: 'sm' }}
              onChange={handleInputChange}
              value={form.businessAddress}
            ></Textarea>
          </FormControl>
          <SimpleGrid minChildWidth="100px" spacing="5">
            <FormControl isInvalid={isError}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Zone
              </FormLabel>
              <Select name="zone" _placeholder={{ fontSize: 'sm' }} required onChange={handleInputChange} value={form.zone}>
                <option value="">Select Zone</option>
                <option value="A">Zone A</option>
                <option value="B">Zone B</option>
                <option value="C">Zone C</option>
                <option value="D">Zone D</option>
                <option value="E">Zone E</option>
                <option value="F">Zone F</option>
                <option value="G">Zone G</option>
                <option value="H">Zone H</option>
                <option value="I">Zone I</option>
                <option value="J">Zone J</option>
                <option value="K">Zone K</option>
              </Select>
              {isError && <FormErrorMessage>Field is required.</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={isError}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Gender
              </FormLabel>
              <Select name="gender" onChange={handleInputChange} required value={form.gender}>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </Select>
            </FormControl>
            <FormControl isInvalid={isError}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Occupation
              </FormLabel>
              <Input
                type="text"
                required
                placeholder="Enter occupation"
                _placeholder={{ fontSize: 'sm' }}
                onChange={handleInputChange}
                value={form.occupation}
                name="occupation"
              />
              {isError && <FormErrorMessage>Field is required.</FormErrorMessage>}
            </FormControl>
          </SimpleGrid>
          <SimpleGrid minChildWidth="100px" spacing="5">
            <FormControl isInvalid={isError}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Date of Baptism
              </FormLabel>
              <Input
                type="date"
                _placeholder={{ fontSize: 'sm' }}
                onChange={handleInputChange}
                value={form.dateOfBaptism ? moment(form.dateOfBaptism).format('yyyy-MM-DD') : null}
                name="dateOfBaptism"
              />
              {isError && <FormErrorMessage>Field is required.</FormErrorMessage>}
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Date of Membership
              </FormLabel>
              <Input
                type="date"
                _placeholder={{ fontSize: 'sm' }}
                onChange={handleInputChange}
                value={form.dateOfMembership ? moment(form.dateOfMembership).format('yyyy-MM-DD') : null}
                name="dateOfMembership"
              />
            </FormControl>
            <FormControl isInvalid={isError}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Place of Origin
              </FormLabel>
              <Input
                required
                type="text"
                _placeholder={{ fontSize: 'sm' }}
                placeholder="Origin"
                onChange={handleInputChange}
                value={form.placeOfBirth}
                name="placeOfBirth"
              />
              {isError && <FormErrorMessage>Field is required.</FormErrorMessage>}
            </FormControl>
          </SimpleGrid>
          <SimpleGrid minChildWidth="100px" spacing="5">
            <FormControl isInvalid={isError}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Membership Status
              </FormLabel>
              <Select onChange={handleInputChange} value={form.status} name="status" required>
                <option value="">Select Status</option>
                <option value="ACTIVE">Active</option>
                <option value="DISFELLOWSHIPPED">Disfellowshipped</option>
                <option value="AWAY">Currently Away</option>
              </Select>
              {isError && <FormErrorMessage>Field is required.</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={isError}>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Marital Status
              </FormLabel>
              <Select onChange={handleInputChange} value={form.maritalStatus} name="maritalStatus" required>
                <option value="">Select Marrital Status</option>
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="WIDOW">Widow</option>
                <option value="WIDOWER">Widower</option>
              </Select>
            </FormControl>
            {form.maritalStatus === 'MARRIED' && (
              <FormControl isInvalid={isError}>
                <FormLabel fontSize="sm" fontWeight="semibold">
                  Spouse
                </FormLabel>
                <Input name="spouse" type="text" _placeholder={{ fontSize: 'sm' }} onChange={handleInputChange} value={form.spouse} />
              </FormControl>
            )}
          </SimpleGrid>
          <Divider />
          {!isEditing && !props.isRestore ? (
            <Box>
              <Button type="submit" isLoading={isLoading} colorScheme="green" fontSize="sm" mr={3} disabled={isError}>
                Submit
              </Button>
              <Button colorScheme="red" fontSize="sm" onClick={resetFields}>
                Clear
              </Button>
            </Box>
          ) : (
            <Box>
              <Button
                type="submit"
                onClick={props.isRestore ? handleRestore : handleUpdate}
                isLoading={props.isRestore ? restoreLoading : updateLoading}
                colorScheme="blue"
                fontSize="sm"
                mr={3}
              >
                {props.isRestore ? 'Restore' : ' Update'}
              </Button>
              <Button colorScheme="red" fontSize="sm" onClick={cancel}>
                Cancel
              </Button>
            </Box>
          )}
        </Stack>
      </form>
    </div>
  )
}

export default Editor
