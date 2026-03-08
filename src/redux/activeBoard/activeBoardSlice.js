import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizaAxiosInstance from '~/utils/authorizaAxios'
import { API_ROOT } from '~/utils/constants'

import { genneratePlaceholderCard } from '~/utils/formatter'
import { isEmpty } from 'lodash'
import { mapOrder } from '~/utils/sorts'
// khởi tạo giá trị State của slice trong redux

const initialState = {
  currentActiveBoard: null
}
// Các hành động gọi api (bất đồng bộ ) và truy cập dữ liệu vào redux, dùng Middleware createAsyncThunk đi kèm với extraReducers
export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId) => {
    const response = await authorizaAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
    // lưu ý axios sẽ trả kết quả về property của nó là data
    return response.data
  }
)
// Khởi tạo một cái Slice trong kho lưu trữ - redux store
export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  // nơi xl dữ liệu đồng bộ
  reducers: {
    // Lưu ý: luôn luôn cần cặp ngoặc nhọn cho function trong reducers dù chỉ 1 dòng, rule của redux toolkit
    updateCurrentActiveBoard: (state, action) => {
      // Action.payload là chuẩn đặt tên nhận dữ liệu vào redux, ở đây chúng ta gắn nó ra 1 biến có nghĩa hơn
      const fullBoard = action.payload
      // xl dữ liệu nếu cần thiết ...
      // update lại dữ liệu của cái curentActiveBoard
      state.currentActiveBoard = fullBoard
    },
    updateCardInBoards: (state, action) => {
      // Update nested Data
      const incomingCard = action.payload

      // Tìm dần từ board -> Column -> card
      const column = state.currentActiveBoard.columns.find(i => i._id === incomingCard.columnId)
      if (column) {
        const card = column.cards.find(i => i._id === incomingCard._id)
        if (card) {
          // card.title = incomingCard.title
          /**
           * Giải thích đoạn dưới, các bạn mới lần đầu sẽ dễ bị lú :D
           * Đơn giản là dùng Object.keys để lấy toàn bộ các properties (keys) của incomingCard về một Array
           * rồi forEach nó ra.
           * Sau đó tùy vào trường hợp cần thì kiểm tra thêm còn không thì cập nhật ngược lại giá trị vào
           * card luôn như bên dưới.
           */
          Object.keys(incomingCard).forEach(key => {
            card[key] = incomingCard[key]
          })
        }
      }
    }
  },
  // Extra Reducers: nơi xl dữ liệu bất đồng bộ
  // và nó nhận là arrow function với tham số là builder, và builder này sẽ có các method để xử lý các action bất đồng bộ được tạo ra bởi createAsyncThunk ở trên
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      // action.payload ở đây chính là cái reponsse.data trả về từ API ở trong createAsyncThunk ở trên
      let board = action.payload
      // Thành viên trong cái board sẽ là gộp lại của 2 mảng owner và member
      board.FE_allUsers = board.owners.concat(board.members)

      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')
      board.columns.forEach(column => {
        // cần xử lý vấn đề kéo that vào column rống (vd 37.2 code hiện tại là ở 69)
        if (isEmpty(column.cards) ) {
          column.cards = [genneratePlaceholderCard(column)]
          column.cardOrderIds = [genneratePlaceholderCard(column)._id]
        }
        else {
        // Sxep các thứ tự các coumn luôn ở đây trước khi đưa Dl xuống các coponent vd71
          column.cards = mapOrder(column?.cards, column?.cardOrderIds, '_id')
        }
      })
      // update lại dữ liệu của cái curentActiveBoard
      state.currentActiveBoard = board
    })
  }
})

// Action creators are generated for each case reducer function
// Action: là nơi dành cho các component bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu trong redux (chạy đồng bộ)
// để ý ở trên thì không thấy properties actions đâu cả, bởi vì những cái action này đc thằng redux tạo tự dộng trên reducer.
export const { updateCurrentActiveBoard, updateCardInBoards } = activeBoardSlice.actions

// selector:  là nơi dành cho các component bên dưới gọi bằng  Hook useSelector() để lấy dữ liệu từ kho reduxra ngoài store để sử dụng
export const selectCurrentActiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard
}
// export default activeBoardSlice.reducer
export const activeBoardReducer = activeBoardSlice.reducer