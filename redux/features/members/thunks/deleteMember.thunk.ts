import axios from 'axios'

export const deleteMember = (id: string) => {
  let url = process.env.NEXT_PUBLIC_API_URL
  return axios
    .delete(`${url}/api/members/${id}`, {
      method: 'DELETE',
    })
    .then(res => {
      if (res.status === 200) {
        return res.data
      } else {
        return res.data
      }
    })
    .catch(err => {
      if (err.response === undefined) {
        return err.message
      } else {
        return err.response.data
      }
    })
}
