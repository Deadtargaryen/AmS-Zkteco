import useSwr from 'swr'
import fetcher from '../lib/fetcher'

type toaststatus = 'info' | 'warning' | 'success' | 'error'

export function useMe() {
  const { data, error } = useSwr('/me', fetcher)

  return {
    user: data,
    isLoading: !data && !error,
    isError: error,
  }
}

export function useMembers() {
  const { data, error } = useSwr('/members', fetcher)

  return {
    members: data || [],
    isLoading: !data && !error,
    isError: error,
  }
}

export function useAttendance() {
  const { data, error } = useSwr('/attendance', fetcher, { refreshInterval: 1000 })

  return {
    attendance: (data && data.attendance) || [],
    isLoading: !data && !error,
    isError: error,
  }
}

export function useMember(id) {
  const { data, error } = useSwr(['/members', id], fetcher)
  return {
    member: data || [],
    isLoading: !data && !error,
    isError: error,
  }
}

export function useUsers() {
  const { data, error } = useSwr('/users', fetcher, { refreshInterval: 1000 })

  return {
    users: data || [],
    isLoading: !data && !error,
    isError: error,
  }
}
