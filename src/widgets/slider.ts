// importing local code, code we have written
import {Window, Widget, RoleType} from "../core/ui";
// importing code from SVG.js library
import {Rect, Circle} from "../core/ui";

class Slider extends Widget {
    private _track: Rect;
    private _thumb: Circle;
    private _activeTrack: Rect;
    private _value: number = 50; // Default to middle position (0-100)
    private _isDragging: boolean = false;
    private _dragOffset: number = 0;
    
    private defaultWidth: number = 200;
    private defaultHeight: number = 30;
    private thumbSize: number = 20;
    private trackHeight: number = 6;
    private _trackColor: string = "#F58020"; // Papaya orange color for track
    private _thumbColor: string = "#FFC87C"; // Lighter papaya for thumb
    
    constructor(parent: Window) {
        super(parent);
        // set defaults
        this.height = this.defaultHeight;
        this.width = this.defaultWidth;
        // set Aria role
        this.role = RoleType.none;
        // render widget
        this.render();
    }
    
    render(): void {
        this._group = (this.parent as Window).window.group();
        // Set the outer svg element
        this.outerSvg = this._group;
        
        // The track (background)
        this._track = this._group.rect(this.width, this.trackHeight)
            .radius(this.trackHeight / 2)
            .fill('#e0e0e0')
            .center(this.width / 2, this.height / 2);
        
        // The active track (filled part)
        const thumbPosition = this.getThumbPosition();
        this._activeTrack = this._group.rect(thumbPosition, this.trackHeight)
            .radius(this.trackHeight / 2)
            .fill(this._trackColor)
            .move(0, this.height / 2 - this.trackHeight / 2);
        
        // The thumb
        this._thumb = this._group.circle(this.thumbSize)
            .fill(this._thumbColor)
            .stroke({ color: '#F58020', width: 2 })
            .center(thumbPosition, this.height / 2)
            .attr('cursor', 'pointer');
        
        // Add a transparent rect on top to prevent selection cursor but allow events
        this._group.rect(this.width, this.height).opacity(0).attr('id', 0);
        
        // Register events
        this.registerEvent(this.outerSvg);
        this.registerEvent(this._thumb);
        this.registerEvent(this._track);
        
        // Set initial state
        this.idleupState();
        
        // Add event listeners for thumb dragging
        this._thumb.on('mousedown', (e: MouseEvent) => this.handleThumbDown(e));
        this._track.on('click', (e: MouseEvent) => this.handleTrackClick(e));
        
        // Add global mousemove and mouseup for dragging
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', () => this.handleMouseUp());
    }
    
    // Get the position of thumb based on current value
    private getThumbPosition(): number {
        return (this._value / 100) * this.width;
    }
    
    // Update the position of the thumb and active track
    private updatePosition(position: number): void {
        // Constrain position to the track width
        const constrainedPos = Math.max(0, Math.min(position, this.width));
        
        // Update value based on position
        this._value = Math.round((constrainedPos / this.width) * 100);
        
        // Update thumb position
        this._thumb.center(constrainedPos, this.height / 2);
        
        // Update active track width
        this._activeTrack.width(constrainedPos);
        
        // Trigger value change event if it exists
        if (this._onValueChange) {
            const args = {
                previousValue: this._value,
                currentValue: this._value
            };
            this._onValueChange(this, args);
        }
    }
    
    // Handle mouse down on thumb
    private handleThumbDown(e: MouseEvent): void {
        this._isDragging = true;
        this.pressedState();
        
        // Calculate offset of click to thumb center
        const thumbRect = (e.target as SVGCircleElement).getBoundingClientRect();
        const thumbCenter = thumbRect.left + thumbRect.width / 2;
        this._dragOffset = e.clientX - thumbCenter;
        
        e.preventDefault();
    }
    
    // Handle click on track
    private handleTrackClick(e: MouseEvent): void {
        const trackRect = (e.target as SVGRectElement).getBoundingClientRect();
        const relativePosition = e.clientX - trackRect.left;
        
        // Update position
        this.updatePosition(relativePosition);
        this.pressReleaseState();
        
        e.preventDefault();
    }
    
    // Handle mouse move for dragging
    private handleMouseMove(e: MouseEvent): void {
        if (!this._isDragging) return;
        
        const trackRect = this._track.node.getBoundingClientRect();
        const relativePosition = e.clientX - trackRect.left - this._dragOffset;
        
        this.updatePosition(relativePosition);
    }
    
    // Handle mouse up to end dragging
    private handleMouseUp(): void {
        if (this._isDragging) {
            this._isDragging = false;
            this.idleupState();
        }
    }
    
    // Event handler for value changes
    private _onValueChange: (sender: Slider, args: SliderValueEventArgs) => void;
    
    // Public method to set value change event handler
    onValueChange(handler: (sender: Slider, args: SliderValueEventArgs) => void): void {
        this._onValueChange = handler;
    }
    
    // Getters and setters for value
    get value(): number {
        return this._value;
    }
    
    set value(val: number) {
        const oldValue = this._value;
        this._value = Math.max(0, Math.min(Math.round(val), 100));
        this.updatePosition(this.getThumbPosition());
        
        // Trigger event handler if value actually changed
        if (oldValue !== this._value && this._onValueChange) {
            const args = {
                previousValue: oldValue,
                currentValue: this._value
            };
            this._onValueChange(this, args);
        }
    }

    // Public method to set the slider width
    setWidth(width: number): void {
        this.width = width;
        
        // Update the UI elements if they exist
        if (this._track && this._activeTrack) {
            this._track.width(width).center(width / 2, this.height / 2);
            this.updatePosition(this.getThumbPosition()); // Update thumb and active track
        }
    }

    // Set track color
    set trackColor(color: string) {
        this._trackColor = color;
        if (this._activeTrack) {
            this._activeTrack.fill(color);
        }
    }

    // Set thumb color
    set thumbColor(color: string) {
        this._thumbColor = color;
        if (this._thumb) {
            this._thumb.fill(color);
        }
    }
    
    // State implementations
    idleupState(): void {
        this._thumb.fill(this._thumbColor).stroke({ color: '#F58020', width: 2 });
        this._activeTrack.fill(this._trackColor);
    }
    
    idledownState(): void {
        // Not used for slider
    }
    
    pressedState(): void {
        this._thumb.fill('#ffa54d').stroke({ color: '#d66a00', width: 2 });
        this._activeTrack.fill('#d66a00');
    }
    
    pressReleaseState(): void {
        this.idleupState();
    }
    
    hoverState(): void {
        this._thumb.fill('#ffe4bd').stroke({ color: '#F58020', width: 2 });
    }
    
    hoverPressedState(): void {
        this.pressedState();
    }
    
    pressedoutState(): void {
        this.idleupState();
    }
    
    moveState(): void {
        // Implementation for move state if needed
    }
    
    keyupState(): void {
        // Implementation for keyboard interactions
        // You could implement arrow key navigation here
    }
}

// Event arguments for slider value changes
interface SliderValueEventArgs {
    previousValue: number;
    currentValue: number;
}

export {Slider, SliderValueEventArgs}