import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  previousLocation: '',
}

const generalSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    setPreviousLocation: (state, action) => {
        return { ...state, previousLocation: action.payload }
      },
  },
})

export default generalSlice
export const {setPreviousLocation} = generalSlice.actions
