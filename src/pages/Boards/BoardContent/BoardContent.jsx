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
import { cloneDeep } from 'lodash'
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
  // tìm 1 cái column theo cardID
  const findColumnByCardId = (cardId) => {
    // đi vào mảng column và đi vào column có chứa mảng card,
    // rồi map mảng card lấy mảng mới có chưa _id
    // //rồi kiểm tra xem mảng mới có chứa cardId mình truyền vào hay chưa
    // nếu chứa thì return
    return orderedColumns.find(column => column.cards.map(card => card._id)?.includes(cardId))
  }
  const handleDragStart = (event) => {
    // console.log('handleDragStart', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)
  }
  // trigger trong quá trình kéo 1 phần tử
  const handleDragOver = (event) => {
    // ko làm gì thêm nếu kéo Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return
    // console.log('handleDragOver', event)
    // còn nếu kéo card xử thêm để kéo card giữa các column
    const { active, over } = event
    if ( !active || !over ) return
    // activeDragingCard: : là card đang kéo
    const { id: activeDragingCardId, data: { current: activeDragingCardData } } = active
    // overCard là cái card đang tuognw tác
    const { id: overCardId } = over
    // tìm 2 cái column theo cardId
    const activeColumn = findColumnByCardId(activeDragingCardId)
    const overColumn = findColumnByCardId(overCardId)

    if ( !activeColumn || !overColumn) return
    // kiểm tra có chạy vào column khác nhau không nếu có thì chạy vào đây
    if (activeColumn._id !==overColumn._id) {
      setOrderedColumns(prevColumns => {
        // tìm vtri của over trong column đích nơi mà activeCard sắp được thả
        const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

        // logic tính toán cho cardIndex mới
        let newCardIndex
        const isBelowOverItem = active.rect.current.translated &&
                active.rect.current.translated.top > over.rect.top + over.rect.height
        const modifier = isBelowOverItem ? 1 : 0
        newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

        // clone mảng orderedColumnStates cũ ra 1 cái mới
        // //để xử lý data rồi return -> cập nhật lại
        const nextColumns = cloneDeep(prevColumns)
        const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
        const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)
        // column cũ
        if (nextActiveColumn) {
          // xóa card ở column(cũ) active
          nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDragingCardId)
          // cập nhật lại mảng cardorderIDs cho chuẩn dulieu
          nextActiveColumn.cardOrderIds =nextActiveColumn.cards.map(card => card._id)
        }

        // column mới
        if (nextOverColumn) {
          // kiểm tra xem cái card đang kéo nó có tồn tại ở overcolumn Id hay chưa,
          // nếu có thì phải xóa bỏ nó trước
          nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDragingCardId)

          // tiếp theo phải thêm card đang kéo vào overColumn theo vitri index mới
          // splice là cập nhật vào mảng cũ toSlipced là tạo ra mảng mới
          nextOverColumn.cards =nextOverColumn.cards.toSpliced(newCardIndex, 0, activeDragingCardData)
          // cập nhật lại mảng cardorderIDs cho chuẩn dulieu
          nextOverColumn.cardOrderIds =nextOverColumn.cards.map(card => card._id)
        }

        return nextColumns
      })
    }
    // console.log('activeColumn', activeColumn),
    // console.log('overColumn', overColumn)
  }
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd', event)
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // console.log('hành động kéo thả card và ko làm gì cả')
      return
    }
    const { active, over } = event
    if (!active || !over) return
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
      onDragOver={handleDragOver}
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
