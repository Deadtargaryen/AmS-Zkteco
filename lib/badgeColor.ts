export const badgeColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'cyan'
    case 'DISFELLOWSHIPPED':
      return 'red'
    case 'AWAY':
      return 'orange'
    default:
      return 'gray'
  }
}

export const attendanceBadgeVariant = (status: string) => {
  if (status === 'Present') {
    return 'green'
  } else if (status === 'Absent') {
    return 'red'
  } else if (status === '---') {
    return ''
  }
}