import fetcher from './fetcher'

export const login = (body: { name: string; password: string }) => {
  return fetcher('/login', body)
}

export const logout = () => {
  return fetcher('/logout')
}

export const newMember = (body: {
  firstname: string
  middlename: string
  lastname: string
  cardNo: number
  address: string
  contactNo: number
  email?: string
  avatarUrl?: string
  dateOfBaptism?: string
  dateOfMembership?: string
  dateOfBirth?: string
  status: string
  gender: string
  placeOfBirth: string
  occupation: string
  maritalStatus: string
  spouse: string
  zone: string
}) => {
  return fetcher('/members', body)
  
}

export const newAttendance = (body: {
  id: number
  date: String
}) => {
  return fetcher('/attendance', body)
}
