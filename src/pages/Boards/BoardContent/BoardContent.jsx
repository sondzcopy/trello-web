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
  useSensor,
  DragOverlay,
  defaultDropAnimationSideEffects
  // useSensors
} from '@dnd-kit/core'
import { useMemo } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'

const ACTIVE_DRAG_ITEM_TYPE ={
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board }) {


  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  const sensors = useMemo(
    () => [mouseSensor, touchSensor],
    [mouseSensor, touchSensor])
  // 1. Dùng useState để giữ trạng thái các cột sau khi kéo thả
  const [orderedColumns, setOrderedColumns] = useState([])


  // cùng 1 thời điểm chirt có 1 phần tử được kéo
  const [activeDragItemId, setActiveDragItemId] = useState([null])
  const [activeDragItemType, setActiveDragItemType] = useState([null])
  const [activeDragItemData, setActiveDragItemData] = useState([null])

  useEffect(() => {
    if (board?.columns && board?.columnOrderIds) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrderedColumns(mapOrder(board.columns, board.columnOrderIds, '_id'))
    }
  }, [board])
  const handleDragStart = (event) => {
    // console.log('handleDragStart', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)
  }
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return
    // Kiểm tra nếu không có vị trí 'over' (kéo ra ngoài) hoặc kéo vào chính nó
    // nếu vtri sau khi kéo thả khác ban đầu
    //     // Tìm vị trí cũ và mới
    if (active.id === over.id) {
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

    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
  }
  const { mode } = useColorScheme()
  const customdropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } }
    })
  }
  return (
    <DndContext
      sensors={sensors}
      onDragStart = {handleDragStart}
      onDragEnd={handleDragEnd} >
      <Box
        sx={{
          bgcolor: mode === 'dark' ? '#34495e' : '#1976d2',
          width: '100%',
          height: (theme) => theme.trello.boardContentHeight,
          p: '10px 0'
        }}
      >
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={customdropAnimation}>
          {(!activeDragItemType) && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData}/>}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData}/>}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
