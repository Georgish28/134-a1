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
    private _checkMarkGroup: any;
    private _labelText: Text;
    private defaultWidth: number = 16;
    private defaultHeight: number = 16;
    private _label: string = "Checkbox";
    private _isChecked: boolean = false;
    private _spacing: number = 8;
    private _fontSize: number = 14;
    
    // Callback for state change event
    private stateChangeCallback: ((sender: CheckBox, args: CheckboxStateEventArgs) => void) | null = null;

    constructor(parent: Window) {
        super(parent);
        
        // Set defaults
        this.height = this.defaultHeight;
        this.width = this.defaultWidth;
        this.role = RoleType.button;
        this.setState(new IdleUpWidgetState());
        this.render();
    }

    /**
     * Creates the visual elements of the checkbox
     */
    render(): void {
        this._group = (this.parent as Window).window.group();
        
        // Rectangle with papaya orange colors
        this._boxRect = this._group.rect(this.defaultWidth, this.defaultHeight)
            .fill('#FF6A13')  // Papaya Orange
            .stroke({ color: '#D4570D', width: 1 }) // Darker orange
            .radius(2);
        

        this._checkMarkGroup = this._group.group();
        let line1 = this._checkMarkGroup.line(4, 8, 7, 11).stroke({ color: '#FFFFFF', width: 2, linecap: 'round' });
        let line2 = this._checkMarkGroup.line(7, 11, 12, 5).stroke({ color: '#FFFFFF', width: 2, linecap: 'round' });
        
        this._checkMarkGroup.opacity(this._isChecked ? 1 : 0);
        this._labelText = this._group.text(this._label)
            .font({ size: this._fontSize, family: 'Arial' })
            .fill('#FF6A13')  // Papaya Orange
            .move(this.defaultWidth + this._spacing, 0);
        

        this.centerLabelVertically();
        this.outerSvg = this._group;
        
        const totalWidth = this.calculateTotalWidth();
        let eventRect = this._group.rect(totalWidth, Math.max(this.defaultHeight, this._fontSize))
            .opacity(0)
            .attr('id', 0);
        
        this.registerEvent(eventRect);

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
            // Access the native SVG text element
            const svgTextElement = this._labelText.node;
            
            // Set the dominant-baseline attribute directly
            svgTextElement.setAttribute('dominant-baseline', 'middle');
            
            // Position at vertical center of checkbox
            this._labelText.center(this._labelText.cx(), this._boxRect.cy());
        }
    }

    /**
     * Updates the visual appearance after property changes
     */
    override update(): void {
        if (this._checkMarkGroup) {
            this._checkMarkGroup.opacity(this._isChecked ? 1 : 0);
        }

        if (this._labelText) {
            this._labelText.text(this._label);
            this.centerLabelVertically();
        }

        const totalWidth = this.calculateTotalWidth();
        const eventRect = this._group.findOne('rect[id="0"]');
        if (eventRect) {
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
        
        this.update();

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


    override pressReleaseState(): void {
        this.toggle();
        this.idleupState();
    }

    idleupState(): void {
        if (this._boxRect) {
            this._boxRect.fill('#FF6A13').stroke({ color: '#D4570D', width: 1 });
        }
        if (this._checkMarkGroup) {
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
        
        if (keyEvent && (keyEvent.key === 'Enter' || keyEvent.key === ' ')) {
            this.toggle();
        }
    }
}

export { CheckBox, CheckboxStateEventArgs };
