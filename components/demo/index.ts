export { DemoStage, frameAt, stageWidth, STAGE_MAX_H, STAGE_MAX_W, type DemoStep, type DemoFrame } from "./stage";
export { Camera, CAMERA_MS } from "./camera";
export { Cursor, CURSOR_MS, type CursorState } from "./cursor";
export { Caption } from "./caption";
export { cameraTransform, type Rect, type Shot } from "@/lib/camera";
export { SnapshotMessage, SnapshotEmbed, type MenuState } from "./snapshot";
export {
  DashboardShot,
  DASHBOARD_SHOTS,
  dashboardPicture,
  dashboardShot,
  shotTarget,
  type DashboardLayout,
  type DashboardPicture,
  type DashboardShotData,
} from "./dashboard-shot";
export { DashboardDemo, useReducedMotion, type DashboardStep } from "./dashboard-demo";
export {
  Canvas,
  canvasPoint,
  canvasRect,
  useWidth,
  zoomTo,
  type CanvasArea,
  type CanvasLayout,
  type CanvasPoint,
} from "./canvas";
export {
  ChatMessage,
  CommandInput,
  DiscordDemo,
  DiscordScene,
  DiscordStill,
  LIST_W,
  MessageWindow,
  NARROW_BELOW,
  stepper,
  type InputState,
  type Pane,
  type SceneLayout,
  type SceneStep,
} from "./discord-scene";
export { SnapshotTabs, type SnapshotTab } from "./snapshot-tabs";
export { Refusal } from "./refusal";
