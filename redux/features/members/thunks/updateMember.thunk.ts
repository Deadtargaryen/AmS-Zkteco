import axios from "axios";

export const updateMember = (data:{id:string, body:{}}) => {
    let {id, body} = data
    let url = process.env.NEXT_PUBLIC_API_URL;
  return axios
    .put(`${url}/api/members/${id}`,body, {
        method: 'PUT'
    })
    .then((res: any) => {
      if (res.status === 200) {
        return res.data;
      } else {
        return res.response.data;
      }
    })
    .catch((err) => {
      if (err.response && err.response === undefined) {
        return err.message;
      } else if (err.response) {
        throw err.response.data;
      } else {
        return {};
      }
    });
};
