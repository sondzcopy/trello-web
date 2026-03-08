import { configureStore } from '@reduxjs/toolkit'
import { activeBoardReducer } from './activeBoard/activeBoardSlice'
import { userReducer } from './user/userSlice'
import { activeCardReducer } from './activeCard/activeCardSlice'

import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'
/**
 * Cấu hình thư viện Redux persist
 */
const rootRersistConfig = {
  key: 'root', // key của persite do chúng ta mặc định, cứ để mặc định là root
  storage: storage, // Biết Storege ở trên lưu vào localS
  whitelist: ['user'] // định nghĩa các SLICE dữ liệu được phép duy trì qua mỗi lần F5 web
  // blacklist: ['user] // định nghĩa các Slice ko được duy trì qua mỗi lần F5
}

const reducers = combineReducers({
  activeBoard: activeBoardReducer,
  user: userReducer,
  activeCard: activeCardReducer
})

const persistedReducer = persistReducer(rootRersistConfig, reducers)


export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER
        ]
      }
    })
})