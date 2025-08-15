import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { initialState } from '../models/members.model'
import { getMembers } from '../thunks/allMembers.thunk'
import { deleteMember } from '../thunks/deleteMember.thunk'
import { newMember } from '../thunks/newMember.thunk'
import { updateMember } from '../thunks/updateMember.thunk'

export const getMembersThunk = createAsyncThunk('members/getMembers', async (_, thunkApI) => {
  try {
    const response = await getMembers()
    return response
  } catch (err) {
    return thunkApI.rejectWithValue(err)
  }
})

export const deleteMemberThunk = createAsyncThunk('members/deleteMember', async (id: string, thunkApI) => {
  try {
    const response = await deleteMember(id)
    return response
  } catch (err) {
    return thunkApI.rejectWithValue(err)
  }
})

export const newMemberThunk = createAsyncThunk('members/newMember', async (body: object, thunkApI) => {
  try {
    const response = await newMember(body)
    return response
  } catch (err) {
    return thunkApI.rejectWithValue(err)
  }
})

export const updateMemberThunk = createAsyncThunk('members/updateMember', async (body: { id: string; body: {} }, thunkApI) => {
  try {
    const response = await updateMember(body)
    return response
  } catch (err) {
    return thunkApI.rejectWithValue(err)
  }
})

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    clearDeleteSuccess: state => {
      return { ...state, deleteSuccess: {} }
    },
    clearDeleteError: state => {
      return { ...state, deleteError: {} }
    },
    clearUpdateSuccess: state => {
      return { ...state, updateSuccess: {} }
    },
    clearUpdateError: state => {
      return { ...state, updateError: {} }
    }
  },
  extraReducers: builder => {
    builder.addCase(getMembersThunk.pending, (state, action) => {
      state.loading = true
    })
    builder.addCase(getMembersThunk.fulfilled, (state, action) => {
      state.loading = false
      state.members = action.payload
    })
    builder.addCase(getMembersThunk.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })

    builder.addCase(deleteMemberThunk.pending, (state, action) => {
      state.loading = true
    })
    builder.addCase(deleteMemberThunk.fulfilled, (state, action) => {
      state.loading = false
      state.deleteSuccess = action.payload
    })
    builder.addCase(deleteMemberThunk.rejected, (state, action) => {
      state.loading = false
      state.deleteError = action.payload
    })

    builder.addCase(newMemberThunk.pending, (state, action) => {
      state.loading = true
    })
    builder.addCase(newMemberThunk.fulfilled, (state, action) => {
      state.loading = false
      state.createSuccess = action.payload
    })
    builder.addCase(newMemberThunk.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })

    builder.addCase(updateMemberThunk.pending, (state, action) => {
      state.loading = true
    })
    builder.addCase(updateMemberThunk.fulfilled, (state, action) => {
      state.loading = false
      state.updateSuccess = action.payload
    })
    builder.addCase(updateMemberThunk.rejected, (state, action) => {
      state.loading = false
      state.updateError = action.payload
    })
  },
})

export default membersSlice
export const { clearDeleteError, clearDeleteSuccess, clearUpdateError, clearUpdateSuccess } = membersSlice.actions
