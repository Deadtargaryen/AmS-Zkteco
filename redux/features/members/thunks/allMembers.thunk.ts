import axios from "axios";

export const getMembers = () => {
    let url = process.env.NEXT_PUBLIC_API_URL;
  return axios
    .get(`${url}/api/members`)
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
