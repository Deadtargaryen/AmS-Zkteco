import { Disfellowship } from '@prisma/client'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type User = {
  name: String
  id: String
  avatarUrl?: String
  role: String
}

export type member = {
  id: String
  firstname: String
  middlename: String
  lastname: String
  cardNo: number
  address: String
  contactNo: String
  email?: String
  avatarUrl?: String
  dateOfBirth?: Date
  dateOfMembership?: Date
  dateOfBaptism?: Date
  zone: { name: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' }
  status: 'ACTIVE' | 'DISFELLOWSHIPPED' | 'AWAY'
  gender: 'MALE' | 'FEMALE'
  placeOfBirth: String
  occupation: String
  maritalStatus: 'SINGLE' | 'MARRIED'
  spouse?: String
}

type userResponse = User[]


const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

export const attendApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `/api`,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
  }),
  tagTypes: ['Attendance', 'Post', 'Users', 'Members', 'Archive'],
  endpoints: build => ({
    getMembers: build.query<member[], void>({
      query: () => ({
        url: '/members',
        method: 'GET',
      }),
      providesTags: ['Members'],
    }),
    deleteMember: build.mutation({
      query: id => ({
        url: `/members/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Members'],
    }),
    addMember: build.mutation({
      query: body => ({
        url: '/members',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Members'],
    }),
    updateMember: build.mutation({
      query: ({ id, body }) => ({
        url: `/members/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Members'],
    }),
    archiveMember: build.mutation({
      query: ({ id, body }) => ({
        url: `/members/archive/${id}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Archive','Members'],
    }),
    restoreMember: build.mutation({
      query: ({ id, body }) => ({
        url: `/members/archive/${id}/restore`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Archive','Members'],
    }),
    getArchivedMembers: build.query<Disfellowship[], void>({
      query: () => ({
        url: '/members/archive',
        method: 'GET',
      }),
      providesTags: ['Archive'],
    }),
    getArchiveMember: build.query<Disfellowship, string>({
      query: (id) => ({
        url: `/members/archive/${id}`,
        method: 'GET',
      }),
      providesTags: ['Archive'],
    }),
    getAttendance: build.query({
      query: () => ({
        url: '/attendance',
        method: 'GET',
      }),
      providesTags: ['Attendance'],
    }),
    addAttendance: build.mutation({
      query: body => ({
        url: '/attendance',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),
    getPaginatedAttendance: build.query({
      query: ({ page, perPage, year = currentYear, month = currentMonth, day = '', zone = '', searchParams }) => ({
        url: `/attendance/paginatedQuery?page=${page}&per_page=${perPage}&year=${year}&month=${month}&day=${day}&zone=${zone}&searchParams=${searchParams}`,
        method: 'GET',
      }),
      providesTags: ['Attendance'],
    }),
    getUsers: build.query<userResponse, void>({
      query: () => ({
        url: '/users',
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),
    addUser: build.mutation({
      query: body => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: build.mutation({
      query: id => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    editUser: build.mutation({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    attendanceReport: build.query({
      query: ({ page, perPage, year = currentYear, month, searchParams }) => ({
        url: `/attendance/attendanceReport?page=${page}&per_page=${perPage}&year=${year}&month=${month}&searchParams=${searchParams}`,
        method: 'GET',
      }),
      providesTags: ['Attendance'],
    }),
    absenteeReport: build.query({
      query: ({ page, perPage, year = currentYear, month = currentMonth, day = '', zone, searchParams }) => ({
        url: `/attendance/absentees?page=${page}&per_page=${perPage}&year=${year}&month=${month}&day=${day}&zone=${zone}&searchParams=${searchParams}`,
        method: 'GET',
      }),
      providesTags: ['Attendance'],
    }),
  }),
})

export const {
  useGetAttendanceQuery,
  useAddAttendanceMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useAddUserMutation,
  useGetPaginatedAttendanceQuery,
  useAttendanceReportQuery,
  useAbsenteeReportQuery,
  useGetMembersQuery,
  useDeleteMemberMutation,
  useAddMemberMutation,
  useUpdateMemberMutation,
  useArchiveMemberMutation,
  useGetArchivedMembersQuery,
  useGetArchiveMemberQuery,
  useRestoreMemberMutation,
  useEditUserMutation,
} = attendApi
