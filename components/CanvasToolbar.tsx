'use client'

import {
  DefaultToolbar,
  NoteToolbarItem,
  SelectToolbarItem,
  HandToolbarItem,
  DrawToolbarItem,
  EraserToolbarItem,
  ArrowToolbarItem,
  TextToolbarItem,
  RectangleToolbarItem,
  EllipseToolbarItem,
  FrameToolbarItem,
  HighlightToolbarItem,
  LineToolbarItem,
  TldrawUiMenuToolItem,
} from 'tldraw'

/**
 * Custom toolbar that promotes the Note (post-it) tool to first position,
 * making sticky notes easy to discover.
 */
export function CanvasToolbar() {
  return (
    <DefaultToolbar>
      {/* ── Sticky note / post-it — first slot ── */}
      <NoteToolbarItem />
      {/* ── Core drawing tools ── */}
      <SelectToolbarItem />
      <HandToolbarItem />
      <DrawToolbarItem />
      <HighlightToolbarItem />
      <EraserToolbarItem />
      {/* ── Text & connectors ── */}
      <TextToolbarItem />
      <ArrowToolbarItem />
      <LineToolbarItem />
      {/* ── Shapes ── */}
      <RectangleToolbarItem />
      <EllipseToolbarItem />
      <TldrawUiMenuToolItem toolId="star" />
      <TldrawUiMenuToolItem toolId="cloud" />
      <TldrawUiMenuToolItem toolId="heart" />
      <TldrawUiMenuToolItem toolId="diamond" />
      {/* ── Frame & media ── */}
      <FrameToolbarItem />
      <TldrawUiMenuToolItem toolId="asset" />
    </DefaultToolbar>
  )
}
