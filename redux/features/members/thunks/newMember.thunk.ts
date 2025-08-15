import axios from "axios";

export const newMember = (body: any) => {
    let url = process.env.NEXT_PUBLIC_API_URL;
  return axios
    .post(`${url}/api/members`,body, {
        method: 'POST'
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
        return err.response.data;
      } else {
        return {};
      }
    });
};
