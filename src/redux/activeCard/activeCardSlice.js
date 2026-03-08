import { createSlice } from '@reduxjs/toolkit'

import { genneratePlaceholderCard } from '~/utils/formatter'
import { isEmpty } from 'lodash'
import { mapOrder } from '~/utils/sorts'
// khởi tạo giá trị State của slice trong redux

const initialState = {
  currentActiveCard: null
}
// Khởi tạo một cái Slice trong kho lưu trữ - redux store
export const activeCardSlice = createSlice({
  name: 'activeCard',
  initialState,
  // nơi xl dữ liệu đồng bộ
  reducers: {
    clearCurrentActiveCard: (state) => {
      state.currentActiveCard = null
    },
    // Lưu ý: luôn luôn cần cặp ngoặc nhọn cho function trong reducers dù chỉ 1 dòng, rule của redux toolkit
    updateCurrentActiveCard: (state, action) => {
      // Action.payload là chuẩn đặt tên nhận dữ liệu vào redux, ở đây chúng ta gắn nó ra 1 biến có nghĩa hơn
      const fullCard = action.payload
      // xl dữ liệu nếu cần thiết ...
      // update lại dữ liệu của cái curentActiveCard
      state.currentActiveCard = fullCard
    }
  },
  // Extra Reducers: nơi xl dữ liệu bất đồng bộ
  // và nó nhận là arrow function với tham số là builder, và builder này sẽ có các method để xử lý các action bất đồng bộ được tạo ra bởi createAsyncThunk ở trên
  extraReducers: (builder) => {}
})

// Action creators are generated for each case reducer function
// Action: là nơi dành cho các component bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu trong redux (chạy đồng bộ)
// để ý ở trên thì không thấy properties actions đâu cả, bởi vì những cái action này đc thằng redux tạo tự dộng trên reducer.
export const { clearCurrentActiveCard, updateCurrentActiveCard } = activeCardSlice.actions

// selector:  là nơi dành cho các component bên dưới gọi bằng  Hook useSelector() để lấy dữ liệu từ kho reduxra ngoài store để sử dụng
export const selectCurrentActiveCard = (state) => {
  return state.activeCard.currentActiveCard
}
// export default activeCardSlice.reducer
export const activeCardReducer = activeCardSlice.reducer