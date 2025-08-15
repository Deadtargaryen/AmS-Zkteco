import { configureStore } from '@reduxjs/toolkit'
import membersSlice from '../features/members/slices/members.slice'
import { attendApi } from './api'
import { setupListeners } from '@reduxjs/toolkit/query'
import authSlice from '../features/members/slices/authSlice'
import generalSlice from '../features/general/general.slice'

const store = configureStore({
  reducer: {
    members: membersSlice.reducer,
    auth: authSlice.reducer,
    [attendApi.reducerPath]: attendApi.reducer,
    general: generalSlice.reducer
  },
  middleware: getDefault => getDefault().concat(attendApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
