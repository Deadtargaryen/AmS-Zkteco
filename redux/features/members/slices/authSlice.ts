import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      return { ...state, user: action.payload }
    },
  },
})

export default authSlice
export const {setUser} = authSlice.actions
