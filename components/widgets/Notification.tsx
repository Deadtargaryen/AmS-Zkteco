import { useToast } from '@chakra-ui/react'

type toaststatus = 'info' | 'warning' | 'success' | 'error'
type notificationProps = {
  title: string
  description: string
  status: toaststatus
}

const Notification = (props: notificationProps) => {
  const toast = useToast()
  toast({
    title: props.title,
    description: props.description,
    status: props.status,
    duration: 5000,
    isClosable: true,
    position: 'top-right',
  })
  return <div></div>
}

export default Notification
