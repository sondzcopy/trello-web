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
  defaultDropAnimationSideEffects,
  closestCorners
  // useSensors
} from '@dnd-kit/core'
import { useMemo } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'
import { cloneDeep, isEmpty } from 'lodash'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { genneratePlaceholderCard } from '~/utils/formatter'
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
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

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
  // function chung xl việc cập nhật lại state trong TH di chuyển Card giữa các column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDragingCardId,
    activeDragingCardData
  ) => {
    setOrderedColumns(prevColumns => {
    //tìm vtri của over trong column đích nơi mà activeCard sắp được thả
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
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [genneratePlaceholderCard(nextActiveColumn)]
        }
        // cập nhật lại mảng cardorderIDs cho chuẩn dulieu
        nextActiveColumn.cardOrderIds =nextActiveColumn.cards.map(card => card._id)
      }

      // nextOverColumn: column mới
      if (nextOverColumn) {
        // kiểm tra xem cái card đang kéo nó có tồn tại ở overcolumn Id hay chưa,
        // nếu có thì phải xóa bỏ nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDragingCardId)
        // đổi với TH DragEnd thì phải cập nhật lại chuẩn dl CardId trong card sau khi kéo Card giữa 2 lolumn khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDragingCardData,
          columnId: nextOverColumn._id
        }
        // console.log('rebuild_activeDraggingCardData', rebuild_activeDraggingCardData)
        // tiếp theo phải thêm card đang kéo vào overColumn theo vitri index mới
        // splice là cập nhật vào mảng cũ toSlipced là tạo ra mảng mới
        nextOverColumn.cards =nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)
        // xóa plahoderCard đi nếu nó đang tồn tại
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlayceholderCard)
        // cập nhật lại mảng cardorderIDs cho chuẩn dulieu
        nextOverColumn.cardOrderIds =nextOverColumn.cards.map(card => card._id)
      }
      return nextColumns
    })
  }
  const handleDragStart = (event) => {
    // console.log('handleDragStart', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ?
      ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)
    // nếu kéo card thì mới thực hiện hahf động set giá trị oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }
  // trigger trong quá trình kéo 1 phần tử
  const handleDragOver = (event) => {
    // Ko làm gì thêm nếu kéo Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    const { active, over } = event
    // Kiểm tra nếu không có over (kéo ra ngoài phạm vi drop) thì return luôn
    if (!active || !over) return

    // activeDragingCardId: là card đang kéo
    const { id: activeDragingCardId, data: { current: activeDragingCardData } } = active
    // overCardId: là cái card đang tương tác (đè lên)
    const { id: overCardId } = over

    // Tìm 2 cái column theo cardId
    const activeColumn = findColumnByCardId(activeDragingCardId)
    const overColumn = findColumnByCardId(overCardId)

    if (!activeColumn || !overColumn) return

    // CHÚ Ý: Chỉ xử lý khi kéo card qua 2 column khác nhau
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDragingCardId,
        activeDragingCardData
      )
    }
  }
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!active || !over) return
    // console.log('handleDragEnd', event)
    // xử lý kéo thả Card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // console.log('hành động kéo thả card và ko làm gì cả')
      // activeDragingCard: : là card đang kéo
      const { id: activeDragingCardId, data: { current: activeDragingCardData } } = active
      // overCard là cái card đang tuognw tác
      const { id: overCardId } = over
      // tìm 2 cái column theo cardId
      const activeColumn = findColumnByCardId(activeDragingCardId)
      const overColumn = findColumnByCardId(overCardId)

      if ( !activeColumn || !overColumn) return

      // ngoài dùng tới activeDragItemData.ColumnId hoặc oldColumnWhenDraggingCard (set vào states từ trước handleDragStart)
      // chứ k phải activeData trong scope handleDragEnd này big sau khí qusa onDragOver tới đây là States của card đang bị cập nhật 1 lần rồi

      // console.log('activeDragItemData', activeDragItemData)
      // console.log('overColumn', overColumn)
      if (oldColumnWhenDraggingCard._id !==overColumn._id) {
        // console.log('Hành đọng kéo thả card giữa 2 column kahcs nhau')
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDragingCardId,
          activeDragingCardData
        )
      } else {
        // console.log('Hành đọng kéo thả card trong cùng 1 column')
        // lấy vtri cũ từ thằng oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        // lấy vtri mới từ thằng overColumn
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)
        // dùng arrayMove vì kéo card trong 1 column logic tương tự kéo column trong 1 boardContent
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)

        setOrderedColumns(prevColumns => {
        // clone mảng orderedColumnStates cũ ra 1 cái mới
        // //để xử lý data rồi return -> cập nhật lại
          const nextColumns = cloneDeep(prevColumns)
          // tìm tới cái column mà chúng ta đang thả
          const targetColumn = nextColumns.find(c => c._id === overColumn._id)
          // cập nhật lại 2 gtri mới là card và cardOderIds trong targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map(card => card._id)
          // console.log('targetColumn', targetColumn)
          // trả về gtri state mới chuẩn vtri
          return nextColumns
        })
      }
    }
    // xử lý kéo thả column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // console.log('hành động kéo thả card và ko làm gì cả')
      // Kiểm tra nếu không có vị trí 'over' (kéo ra ngoài) hoặc kéo vào chính nó
      // nếu vtri sau khi kéo thả khác ban đầu
      //     // Tìm vị trí cũ và mới
      if (active.id !== over.id) {
        const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id)
        const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id)
        // dùng ArryMove của dnd-kit để sắp xếp mảng ban đầu
        // Dùng hàm arrayMove của dnd-kit để tạo mảng mới
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
        // const dndOrderedColumnsId = dndOrderedColumns.map(c => c._id)
        // console.log('dndOrderedColumns: ', dndOrderedColumns)


        // 3. Cập nhật lại State để giao diện thay đổi ngay lập tức
        setOrderedColumns(dndOrderedColumns)
      }
    }
    // Những dl sau khi kéo thả này luôn phải đưa về giá trị null ban đầu
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
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
      collisionDetection={closestCorners}
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
