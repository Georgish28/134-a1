// importing local code, code we have written
import {IdleUpWidgetState} from "../core/ui";
import {Window, Widget, RoleType, EventArgs} from "../core/ui";
// importing code from SVG.js library
import {Rect, Text} from "../core/ui";

/**
 * Event arguments specific to checkbox state change events
 */
class CheckboxStateEventArgs extends EventArgs {
    private _isChecked: boolean;

    constructor(sender: any, isChecked: boolean) {
        super(sender);
        this._isChecked = isChecked;
    }

    get isChecked(): boolean {
        return this._isChecked;
    }
}

/**
 * A checkbox widget that allows toggling between checked and unchecked states
 */
class CheckBox extends Widget {
    private _boxRect: Rect;
    private _checkMarkGroup: any; // Using group instead of Path
    private _labelText: Text;
    
    // Default properties
    private defaultWidth: number = 16;
    private defaultHeight: number = 16;
    private _label: string = "Checkbox";
    private _isChecked: boolean = false;
    private _spacing: number = 8; // Space between checkbox and label
    private _fontSize: number = 14;
    
    // Callback for state change event
    private stateChangeCallback: ((sender: CheckBox, args: CheckboxStateEventArgs) => void) | null = null;

    constructor(parent: Window) {
        super(parent);
        
        // Set defaults
        this.height = this.defaultHeight;
        this.width = this.defaultWidth;
        
        // Set Aria role - we'll use "button" since there's no specific checkbox role in the provided enum
        this.role = RoleType.button;
        
        // Set default state
        this.setState(new IdleUpWidgetState());
        
        // Render widget
        this.render();
    }

    /**
     * Creates the visual elements of the checkbox
     */
    render(): void {
        this._group = (this.parent as Window).window.group();
        
        // Box rectangle with McLaren papaya orange colors
        this._boxRect = this._group.rect(this.defaultWidth, this.defaultHeight)
            .fill('#FF6A13')  // McLaren Papaya Orange
            .stroke({ color: '#D4570D', width: 1 }) // Darker orange for border
            .radius(2);
        
        // Create checkmark using lines instead of a Path
        this._checkMarkGroup = this._group.group();
        
        // Draw checkmark using two lines for the check symbol
        let line1 = this._checkMarkGroup.line(4, 8, 7, 11).stroke({ color: '#FFFFFF', width: 2, linecap: 'round' });
        let line2 = this._checkMarkGroup.line(7, 11, 12, 5).stroke({ color: '#FFFFFF', width: 2, linecap: 'round' });
        
        // Initially hide checkmark if not checked
        this._checkMarkGroup.opacity(this._isChecked ? 1 : 0);
        
        // Label text with McLaren papaya orange theme
        this._labelText = this._group.text(this._label)
            .font({ size: this._fontSize, family: 'Arial' })
            .fill('#FF6A13')  // McLaren Papaya Orange
            .move(this.defaultWidth + this._spacing, 0);
        
        // Vertically center the label with the checkbox
        this.centerLabelVertically();
        
        // Set the outer svg element
        this.outerSvg = this._group;
        
        // Create hit area for the entire widget (checkbox + label)
        const totalWidth = this.calculateTotalWidth();
        let eventRect = this._group.rect(totalWidth, Math.max(this.defaultHeight, this._fontSize))
            .opacity(0)
            .attr('id', 0);
        
        // Register events
        this.registerEvent(eventRect);
        
        // Initial update to apply default state
        this.update();
    }

    /**
     * Calculates the total width of the checkbox including label
     */
    private calculateTotalWidth(): number {
        if (this._labelText) {
            const bbox = this._labelText.bbox();
            return this.defaultWidth + this._spacing + bbox.width;
        }
        return this.defaultWidth;
    }

    /**
     * Centers the label text vertically relative to the checkbox
     */
    private centerLabelVertically(): void {
        if (this._labelText) {
            const bbox = this._labelText.bbox();
            const yPos = (this.defaultHeight - bbox.height) / 2;
            this._labelText.y(yPos);
        }
    }

    /**
     * Updates the visual appearance after property changes
     */
    override update(): void {
        // Update checkbox appearance based on checked state
        if (this._checkMarkGroup) {
            this._checkMarkGroup.opacity(this._isChecked ? 1 : 0);
        }
        
        // Update label if changed
        if (this._labelText) {
            this._labelText.text(this._label);
            this.centerLabelVertically();
        }
        
        // Update event rectangle size
        const totalWidth = this.calculateTotalWidth();
        const eventRect = this._group.findOne('rect[id="0"]');
        if (eventRect) {
            // Avoid using width/height properties directly
            eventRect.attr({
                width: totalWidth,
                height: Math.max(this.defaultHeight, this._fontSize)
            });
        }
        
        super.update();
    }

    /**
     * Toggles the checked state of the checkbox
     */
    toggle(): void {
        this.checked = !this._isChecked;
    }

    /**
     * Gets the current checked state
     */
    get checked(): boolean {
        return this._isChecked;
    }

    /**
     * Sets the checked state
     */
    set checked(value: boolean) {
        const previousValue = this._isChecked;
        this._isChecked = value;
        
        // Update visual representation
        this.update();
        
        // Trigger state change event if value has changed
        if (this._isChecked !== previousValue && this.stateChangeCallback) {
            this.stateChangeCallback(this, new CheckboxStateEventArgs(this, this._isChecked));
        }
    }

    /**
     * Gets the current label text
     */
    get label(): string {
        return this._label;
    }

    /**
     * Sets the label text
     */
    set label(value: string) {
        this._label = value;
        this.update();
    }

    /**
     * Gets the current font size
     */
    get fontSize(): number {
        return this._fontSize;
    }

    /**
     * Sets the font size
     */
    set fontSize(value: number) {
        this._fontSize = value;
        if (this._labelText) {
            this._labelText.font({ size: value });
            this.centerLabelVertically();
        }
        this.update();
    }

    /**
     * Registers a callback for checked state change events
     * @param callback The function to call when checked state changes
     */
    onCheckedChange(callback: (sender: CheckBox, args: CheckboxStateEventArgs) => void): void {
        this.stateChangeCallback = callback;
    }

    // State methods implementation

    override pressReleaseState(): void {
        // Toggle checkbox when clicked
        this.toggle();
        this.idleupState();
    }

    idleupState(): void {
        if (this._boxRect) {
            this._boxRect.fill('#FF6A13').stroke({ color: '#D4570D', width: 1 });
        }
        if (this._checkMarkGroup) {
            // Update all lines in the group
            this._checkMarkGroup.each((line: any) => {
                line.stroke({ color: '#FFFFFF', width: 2 });
            });
        }
        if (this._labelText) {
            this._labelText.fill('#FF6A13');
        }
        this.update();
    }

    idledownState(): void {
        if (this._boxRect) {
            this._boxRect.fill('#FF8C3D').stroke({ color: '#D4570D', width: 1 });
        }
        if (this._checkMarkGroup) {
            this._checkMarkGroup.each((line: any) => {
                line.stroke({ color: '#FFFFFF', width: 2 });
            });
        }
        if (this._labelText) {
            this._labelText.fill('#FFFFFF');
        }
        this.update();
    }

    pressedState(): void {
        if (this._boxRect) {
            this._boxRect.fill('#D4570D').stroke({ color: '#B2430B', width: 1 });
        }
        if (this._checkMarkGroup) {
            this._checkMarkGroup.each((line: any) => {
                line.stroke({ color: '#FFFFFF', width: 2 });
            });
        }
        if (this._labelText) {
            this._labelText.fill('#FFFFFF');
        }
        this.update();
    }

    hoverState(): void {
        if (this._boxRect) {
            this._boxRect.fill('#FF8C3D').stroke({ color: '#B2430B', width: 1 });
        }
        if (this._checkMarkGroup) {
            this._checkMarkGroup.each((line: any) => {
                line.stroke({ color: '#FF6A13', width: 2 });
            });
        }
        if (this._labelText) {
            this._labelText.fill('#FF6A13');
        }
        this.update();
    }

    hoverPressedState(): void {
        if (this._boxRect) {
            this._boxRect.fill('#FF6A13').stroke({ color: '#B2430B', width: 1 });
        }
        if (this._checkMarkGroup) {
            this._checkMarkGroup.each((line: any) => {
                line.stroke({ color: '#FF6A13', width: 2 });
            });
        }
        if (this._labelText) {
            this._labelText.fill('#FF6A13');
        }
        this.update();
    }

    pressedoutState(): void {
        this.idleupState();
    }

    moveState(): void {
        if (this._boxRect) {
            this._boxRect.fill('#FF8C3D').stroke({ color: '#D4570D', width: 1, dasharray: '2,2' });
        }
        if (this._checkMarkGroup) {
            this._checkMarkGroup.each((line: any) => {
                line.stroke({ color: '#FF6A13', width: 2 });
            });
        }
        if (this._labelText) {
            this._labelText.fill('#FF6A13');
        }
        this.update();
    }

    keyupState(keyEvent?: KeyboardEvent): void {
        this.idleupState();
        
        // Toggle checkbox on Enter or Space key press
        if (keyEvent && (keyEvent.key === 'Enter' || keyEvent.key === ' ')) {
            this.toggle();
        }
    }
}

export { CheckBox, CheckboxStateEventArgs };
