import React from 'react'
import Box from '@mui/material/Box'
import { useColorScheme } from '@mui/material/styles'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import {
  DndContext,
  // PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor
  // useSensors
} from '@dnd-kit/core'
import { useMemo } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'

function BoardContent({ board }) {


  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  const sensors = useMemo(
    () => [mouseSensor, touchSensor],
    [mouseSensor, touchSensor])
  // 1. Dùng useState để giữ trạng thái các cột sau khi kéo thả
  const [orderedColumns, setOrderedColumns] = useState([])

  useEffect(() => {
    if (board?.columns && board?.columnOrderIds) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrderedColumns(mapOrder(board.columns, board.columnOrderIds, '_id'))
    }
  }, [board])

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return
    // Kiểm tra nếu không có vị trí 'over' (kéo ra ngoài) hoặc kéo vào chính nó
    // nếu vtri sau khi kéo thả khác ban đầu
    if (active.id === over.id) return

    // Tìm vị trí cũ và mới
    const oldIndex = orderedColumns.findIndex(c => c._id === active.id)
    const newIndex = orderedColumns.findIndex(c => c._id === over.id)
    // dùng ArryMove của dnd-kit để sắp xếp mảng ban đầu
    // Dùng hàm arrayMove của dnd-kit để tạo mảng mới
    const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex)
    // const dndOrderedColumnsId = dndOrderedColumns.map(c => c._id)
    // console.log('dndOrderedColumns: ', dndOrderedColumns)

    // 3. Cập nhật lại State để giao diện thay đổi ngay lập tức
    setOrderedColumns(dndOrderedColumns)
  }
  const { mode } = useColorScheme()
  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <Box
        sx={{
          bgcolor: mode === 'dark' ? '#34495e' : '#1976d2',
          width: '100%',
          height: (theme) => theme.trello.boardContentHeight,
          p: '10px 0'
        }}
      >
        <ListColumns columns={orderedColumns} />
      </Box>
    </DndContext>
  )
}

export default BoardContent
