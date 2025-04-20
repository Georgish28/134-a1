// importing local code, code we have written
import {IdleUpWidgetState} from "../core/ui";
import {Window, Widget, RoleType, EventArgs} from "../core/ui";
// importing code from SVG.js library
import {Circle, Text} from "../core/ui";

/**
 * Event arguments for radio button selection events
 */
class RadioButtonStateEventArgs extends EventArgs {
    private _selectedIndex: number;
    private _selectedLabel: string;

    constructor(sender: any, selectedIndex: number, selectedLabel: string) {
        super(sender);
        this._selectedIndex = selectedIndex;
        this._selectedLabel = selectedLabel;
    }

    get selectedIndex(): number {
        return this._selectedIndex;
    }

    get selectedLabel(): string {
        return this._selectedLabel;
    }
}

/**
 * RadioButton item structure
 */
interface RadioButtonItem {
    label: string;
    checked: boolean;
    circle: Circle;
    innerCircle: Circle;
    labelText: Text;
}

/**
 * A radio button group widget that allows selecting one option from multiple choices
 */
class RadioButton extends Widget {
    private _radius: number = 8;
    private _spacing: number = 8;
    private _verticalGap: number = 8;
    private _fontSize: number = 14;
    private _items: RadioButtonItem[] = [];
    private _onSelectionChange: ((sender: RadioButton, args: RadioButtonStateEventArgs) => void) | null = null;
    private _eventTarget: any = null;

    constructor(parent: Window) {
        super(parent);
        this.height = 0;
        this.width = 0;
        this.role = RoleType.group;
        this.setState(new IdleUpWidgetState());
        this._items.push(
            { label: "Option 1", checked: true, circle: null, innerCircle: null, labelText: null },
            { label: "Option 2", checked: false, circle: null, innerCircle: null, labelText: null }
        );
        this.render();
    }

    render(): void {
        this._group = (this.parent as Window).window.group();
        const totalHeight = this._items.length * (this._radius * 2 + this._verticalGap) - this._verticalGap;
        this.height = totalHeight;

        let maxLabelWidth = 0;
        let yPos = 0;

        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            item.circle = this._group.circle(this._radius * 2)
                .fill('#FFD580')
                .stroke({ color: '#FFB347', width: 2 })
                .move(0, yPos);

            item.innerCircle = this._group.circle(this._radius)
                .fill('#D95F00')
                .center(item.circle.cx(), item.circle.cy())
                .opacity(item.checked ? 1 : 0);

            item.labelText = this._group.text(item.label)
                .font({ size: this._fontSize, family: 'Arial' })
                .fill('#4A2C1D')
                .move(this._radius * 2 + this._spacing, yPos);

            const bbox = item.labelText.bbox();
            item.labelText.dy((this._radius * 2 - bbox.height) / 2);
            maxLabelWidth = Math.max(maxLabelWidth, bbox.width);

            const hitRect = this._group.rect(
                this._radius * 2 + this._spacing + bbox.width,
                this._radius * 2
            ).opacity(0)
             .attr('id', i.toString())
             .move(0, yPos);

            this.registerEvent(hitRect);
            yPos += this._radius * 2 + this._verticalGap;
        }

        this.width = this._radius * 2 + this._spacing + maxLabelWidth;
        this.outerSvg = this._group;
        this.update();
    }

    override update(): void {
        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            if (item.innerCircle) {
                item.innerCircle.opacity(item.checked ? 1 : 0);
            }
            if (item.labelText) {
                item.labelText.text(item.label);
                const bbox = item.labelText.bbox();
                item.labelText.dy((this._radius * 2 - bbox.height) / 2);
            }
        }
        super.update();
    }

    /**
     * Gets labels for all radio buttons
     */
    get labels(): string[] {
        return this._items.map(item => item.label);
    }

    /**
     * Sets labels for all radio buttons
     */
    set labels(values: string[]) {
        // Ensure we have at least 2 labels
        if (values.length < 2) {
            values = [...values, ...Array(2 - values.length).fill("Option")];
        }
        
        for (let i = 0; i < Math.min(values.length, this._items.length); i++) {
            this._items[i].label = values[i];
        }

        if (values.length > this._items.length) {
            for (let i = this._items.length; i < values.length; i++) {
                this._items.push({
                    label: values[i],
                    checked: false,
                    circle: null,
                    innerCircle: null,
                    labelText: null
                });
            }

            this.clear();
            this.render();
        }

        this.update();
    }

    /**
     * Clears rendered elements
     */
    private clear(): void {
        if (this._group) {
            this._group.clear();
            
            for (const item of this._items) {
                item.circle = null;
                item.innerCircle = null;
                item.labelText = null;
            }
        }
    }

    /**
     * Gets selected radio button index
     */
    get selectedIndex(): number {
        return this._items.findIndex(item => item.checked);
    }

    /**
     * Sets selected radio button by index
     */
    set selectedIndex(index: number) {
        if (index >= 0 && index < this._items.length) {
            const previousIndex = this.selectedIndex;

            this._items.forEach((item, i) => {
                item.checked = (i === index);
            });
            
            this.update();

            if (previousIndex !== index && this._onSelectionChange) {
                this._onSelectionChange(
                    this, 
                    new RadioButtonStateEventArgs(this, index, this._items[index].label)
                );
            }
        }
    }

    /**
     * Gets selected radio button label
     */
    get selectedLabel(): string {
        const index = this.selectedIndex;
        return index >= 0 ? this._items[index].label : "";
    }

    /**
     * Sets label for an item at given index
     */
    setLabelAt(index: number, label: string): void {
        if (index >= 0 && index < this._items.length) {
            this._items[index].label = label;
            this.update();
        }
    }

    /**
     * Gets the number of radio buttons
     */
    get itemCount(): number {
        return this._items.length;
    }

    /**
     * Sets the number of radio buttons
     */
    set itemCount(count: number) {
        // Ensure minimum of 2 items
        count = Math.max(2, count);
        
        if (count > this._items.length) {
            // Add new items
            for (let i = this._items.length; i < count; i++) {
                this._items.push({
                    label: `Option ${i + 1}`,
                    checked: false,
                    circle: null,
                    innerCircle: null,
                    labelText: null
                });
            }
        } else if (count < this._items.length) {
            // Remove items
            this._items = this._items.slice(0, count);
            
            // Ensure one item is selected
            if (!this._items.some(item => item.checked)) {
                this._items[0].checked = true;
            }
        }
        
        // Re-render
        this.clear();
        this.render();
    }

    /**
     * Registers callback for selection change events
     */
    onSelectionChange(callback: (sender: RadioButton, args: RadioButtonStateEventArgs) => void): void {
        this._onSelectionChange = callback;
    }

    /**
     * Override event registration to track target
     */
    override registerEvent(element: any): void {
        super.registerEvent(element);
        
        if (element) {
            element.on('mousedown touchstart', () => {
                this._eventTarget = element;
            });
            
            element.on('mouseover', () => {
                this._eventTarget = element;
            });
        }
    }

    /**
     * Handle press release
     */
    override pressReleaseState(): void {
        if (this._eventTarget) {
            const id = this._eventTarget.attr('id');
            if (id !== undefined && id !== null) {
                const index = parseInt(id);
                if (!isNaN(index) && index >= 0 && index < this._items.length) {
                    this.selectedIndex = index;
                }
            }
        }
        
        this.idleupState();
    }

    idleupState(): void {
        for (const item of this._items) {
            if (item.circle) {
                item.circle.fill('#FFD580').stroke({ color: '#FFB347', width: 2 });
            }
            if (item.innerCircle) {
                item.innerCircle.fill('#D95F00');
            }
            if (item.labelText) {
                item.labelText.fill('#4A2C1D');
            }
        }
    }

    idledownState(): void {
        this.idleupState();
    }

    pressedState(): void {
        if (this._eventTarget) {
            const id = this._eventTarget.attr('id');
            if (id !== undefined && id !== null) {
                const index = parseInt(id);
                if (!isNaN(index) && index >= 0 && index < this._items.length) {
                    const item = this._items[index];
                    if (item.circle) {
                        item.circle.fill('#FFC266');
                    }
                }
            }
        }
    }

    hoverState(): void {
        if (this._eventTarget) {
            const id = this._eventTarget.attr('id');
            if (id !== undefined && id !== null) {
                const index = parseInt(id);
                if (!isNaN(index) && index >= 0 && index < this._items.length) {
                    const item = this._items[index];
                    if (item.circle) {
                        item.circle.fill('#FFE0A3').stroke({ color: '#FFB347', width: 2 });
                    }
                    if (item.labelText) {
                        item.labelText.fill('#D95F00');
                    }
                }
            }
        }
    }

    hoverPressedState(): void {
        this.pressedState();
    }

    pressedoutState(): void {
        this.idleupState();
    }

    moveState(): void {
        for (const item of this._items) {
            if (item.circle) {
                item.circle.fill('#F4D5A6').stroke({ color: '#D8CAB8', width: 2, dasharray: '2,2' });
            }
            if (item.labelText) {
                item.labelText.fill('#D8CAB8');
            }
        }
    }

    keyupState(keyEvent?: KeyboardEvent): void {
        this.idleupState();
        if (keyEvent) {
            const currentIndex = this.selectedIndex;
            if (keyEvent.key === 'ArrowDown') {
                this.selectedIndex = (currentIndex + 1) % this._items.length;
            } else if (keyEvent.key === 'ArrowUp') {
                this.selectedIndex = (currentIndex - 1 + this._items.length) % this._items.length;
            }
        }
    }
}

export { RadioButton, RadioButtonStateEventArgs };