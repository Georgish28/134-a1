import { Window, Widget, RoleType } from "../core/ui";
import { Rect } from "../core/ui";

class ScrollBar extends Widget {
  private track: Rect;
  private thumb: Rect;
  private upButton: Rect;
  private downButton: Rect;
  private _scrollbarHeight: number = 150;
  private thumbHeight: number = 30;
  private _thumbPosition: number = 0;

  onThumbMove: (direction: "up" | "down" | "jump") => void = () => {};

  constructor(parent: Window) {
    super(parent);
    this.role = RoleType.none;
    this.render();
  }

  set scrollbarHeight(value: number) {
    this._scrollbarHeight = value;
    if (this.track) {
      this.track.height(this._scrollbarHeight);
      const trackBottom = Number(this.track.y()) + this._scrollbarHeight;
      this.downButton.y(trackBottom);
    }
  }

  get thumbPosition(): number {
    return this._thumbPosition;
  }

  render(): void {
    this._group = (this.parent as Window).window.group();
    this.outerSvg = this._group;

    // Track
    this.track = this._group.rect(20, this._scrollbarHeight)
      .fill("#FFE0A3") // light papaya
      .move(20, 20);
    this.registerEvent(this.track);
    this.track.on("click", (event: MouseEvent) => this.jumpToPosition(event));

    // Up Button
    this.upButton = this._group.rect(20, 20)
      .fill("#D95F00") // deep orange
      .move(20, 0);
    this.registerEvent(this.upButton);
    this.upButton.on("click", () => this.moveThumb("up"));

    // Down Button
    const trackBottom = Number(this.track.y()) + this._scrollbarHeight;
    this.downButton = this._group.rect(20, 20)
      .fill("#D95F00") // deep orange
      .move(20, trackBottom);
    this.registerEvent(this.downButton);
    this.downButton.on("click", () => this.moveThumb("down"));

    // Thumb
    this.thumb = this._group.rect(20, this.thumbHeight)
      .fill("#FFB347") // papaya orange
      .move(20, 20);
    this.registerEvent(this.thumb);
  }

  private moveThumb(direction: "up" | "down"): void {
    const step = 10;
    let newPos = this._thumbPosition;

    if (direction === "up") {
      newPos = Math.max(0, this._thumbPosition - step);
    } else if (direction === "down") {
      newPos = Math.min(this._scrollbarHeight - this.thumbHeight, this._thumbPosition + step);
    }

    if (newPos !== this._thumbPosition) {
      this._thumbPosition = newPos;
      const trackTop = Number(this.track.y());
      this.thumb.y(trackTop + this._thumbPosition);
      this.onThumbMove(direction);
    }
  }

  private jumpToPosition(event: MouseEvent): void {
    const svgY = event.offsetY;
    const trackTop = Number(this.track.y());
    const trackBottom = trackTop + this._scrollbarHeight;

    let clickedPosition = svgY - trackTop;
    clickedPosition = Math.max(0, Math.min(clickedPosition, this._scrollbarHeight - this.thumbHeight));

    this._thumbPosition = clickedPosition;
    this.thumb.y(trackTop + this._thumbPosition);
    this.onThumbMove("jump");
  }

  idleupState(): void {}
  idledownState(): void {}
  pressedState(): void {}
  pressReleaseState(): void {}
  hoverState(): void {}
  hoverPressedState(): void {}
  pressedoutState(): void {}
  moveState(): void {}
  keyupState(): void {}
}

export { ScrollBar };


