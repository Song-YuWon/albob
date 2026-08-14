"use client";

import { useRef, useState, type PointerEvent } from "react";

// 핸들을 이만큼 아래로 끌면 닫힘으로 처리한다
const DISMISS_DRAG_THRESHOLD_PX = 100;

// 아래로 끌어서 닫는 제스처 — 검색창 입력 자체는 텍스트 커서 조작과 충돌하니 그 위에서
// 시작한 터치는 드래그로 취급하지 않는다(호출부에서 드래그 영역에 input을 포함시키되
// handleDragStart가 알아서 걸러낸다). 터치 전용 Touch Events 대신 마우스에서도 동일하게
// 동작하는 Pointer Events를 쓴다.
export function useSheetDragDismiss(onDismiss: () => void) {
  const [dragY, setDragY] = useState(0);
  const dragStartYRef = useRef<number | null>(null);

  const handleDragStart = (event: PointerEvent) => {
    if ((event.target as HTMLElement).closest("input")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartYRef.current = event.clientY;
  };
  const handleDragMove = (event: PointerEvent) => {
    if (dragStartYRef.current === null) return;
    const delta = event.clientY - dragStartYRef.current;
    if (delta > 0) setDragY(delta);
  };
  const handleDragEnd = () => {
    if (dragStartYRef.current === null) return;
    if (dragY > DISMISS_DRAG_THRESHOLD_PX) {
      onDismiss();
      return;
    }
    setDragY(0);
    dragStartYRef.current = null;
  };

  return { dragY, handleDragStart, handleDragMove, handleDragEnd };
}
