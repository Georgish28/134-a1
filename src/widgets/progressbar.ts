// importing local code, code we have written
import {IdleUpWidgetState} from "../core/ui";
import {Window, Widget, RoleType, EventArgs} from "../core/ui";
// importing code from SVG.js library
import {Rect, Text} from "../core/ui";

/**
 * Event arguments specific to progress bar increment events
 */
class ProgressIncrementEventArgs extends EventArgs {
    private _currentValue: number;
    private _previousValue: number;

    constructor(sender: any, currentValue: number, previousValue: number) {
        super(sender);
        this._currentValue = currentValue;
        this._previousValue = previousValue;
    }

    get currentValue(): number {
        return this._currentValue;
    }

    get previousValue(): number {
        return this._previousValue;
    }
}

/**
 * A progress bar widget that displays visual feedback about an ongoing operation
 */
class ProgressBar extends Widget {
    private _backgroundRect: Rect;
    private _progressRect: Rect;
    private _percentText: Text;
    
    // Default properties
    private defaultWidth: number = 200;
    private defaultHeight: number = 20;
    private _value: number = 0; // Current progress value (0-100)
    private _incrementValue: number = 10; // Default increment step
    private _showPercentage: boolean = true; // Whether to show percentage text

    // Callbacks for events
    private incrementCallback: ((sender: ProgressBar, args: ProgressIncrementEventArgs) => void) | null = null;
    private stateChangeCallback: ((sender: ProgressBar, args: EventArgs) => void) | null = null;

    constructor(parent: Window) {
        super(parent);
        
        // Set defaults
        this.height = this.defaultHeight;
        this.width = this.defaultWidth;
        
        // Set Aria role for accessibility
        this.role = RoleType.none;
        
        // Set default state
        this.setState(new IdleUpWidgetState());
        
        // Render widget
        this.render();
    }

    /**
     * Creates the visual elements of the progress bar
     */
    render(): void {
        this._group = (this.parent as Window).window.group();
        
        // Background rectangle (empty progress bar)
        this._backgroundRect = this._group.rect(this.width, this.height)
            .fill('#FFF4E0')  // Papaya background color
            .stroke({ color: '#FFD699', width: 1 }) // Papaya border
            .radius(4); // Apply radius to all corners
        
        // Progress rectangle (filled portion)
        this._progressRect = this._group.rect(this.calculateProgressWidth(), this.height)
            .fill('#FFAB5B') // Papaya progress color
            .radius(4); // Apply radius to all corners
        
        // Percentage text
        this._percentText = this._group.text(`${this._value}%`)
            .font({ size: 12, family: 'Arial', weight: 'bold' })
            .fill('#333333') // Dark gray for text
            .center(this.width / 2, this.height / 2);
        
        // Set the outer svg element
        this.outerSvg = this._group;
        
        // Add a transparent rect on top to handle mouse events
        let eventRect = this._group.rect(this.width, this.height).opacity(0).attr('id', 0);
        
        // Register events
        this.registerEvent(eventRect);
        
        // Initial update to apply default state
        this.update();
    }

    /**
     * Updates the visual appearance after property changes
     */
    override update(): void {
        if (this._backgroundRect) {
            this._backgroundRect.width(this.width);
            this._backgroundRect.height(this.height);
        }
        
        if (this._progressRect) {
            this._progressRect.width(this.calculateProgressWidth());
            this._progressRect.height(this.height);
        }
        
        if (this._percentText) {
            this._percentText.text(`${this._value}%`);
            this._percentText.center(this.width / 2, this.height / 2);
            this._percentText.opacity(this._showPercentage ? 1 : 0);
        }
        
        super.update();
    }

    /**
     * Calculates the width of the progress rectangle based on current value
     */
    private calculateProgressWidth(): number {
        return (this._value / 100) * this.width;
    }

    /**
     * Gets the current progress value (0-100)
     */
    get value(): number {
        return this._value;
    }

    /**
     * Sets the progress value (0-100)
     */
    set value(newValue: number) {
        const previousValue = this._value;
        
        // Clamp value between 0 and 100
        this._value = Math.max(0, Math.min(100, newValue));
        
        // Update visual representation
        this.update();
        
        // Trigger increment event if value has changed
        if (this._value !== previousValue && this.incrementCallback) {
            this.incrementCallback(this, new ProgressIncrementEventArgs(this, this._value, previousValue));
        }
    }

    /**
     * Gets the increment step value
     */
    get incrementValue(): number {
        return this._incrementValue;
    }

    /**
     * Sets the increment step value
     */
    set incrementValue(value: number) {
        this._incrementValue = value;
    }

    /**
     * Gets whether to show percentage text
     */
    get showPercentage(): boolean {
        return this._showPercentage;
    }

    /**
     * Sets whether to show percentage text
     */
    set showPercentage(value: boolean) {
        this._showPercentage = value;
        this.update();
    }

    /**
     * Increments the progress bar by the default increment value
     */
    increment(): void {
        this.value = this._value + this._incrementValue;
    }

    /**
     * Increments the progress bar by a custom amount
     * @param amount The amount to increment (0-100)
     */
    incrementBy(amount: number): void {
        this.value = this._value + amount;
    }

    /**
     * Sets the progress to a specific percentage
     * @param percentage The percentage to set (0-100)
     */
    setProgress(percentage: number): void {
        this.value = percentage;
    }

    /**
     * Resets the progress bar to 0%
     */
    reset(): void {
        this.value = 0;
    }

    /**
     * Registers a callback for progress increment events
     * @param callback The function to call when progress increments
     */
    onIncrement(callback: (sender: ProgressBar, args: ProgressIncrementEventArgs) => void): void {
        this.incrementCallback = callback;
    }

    /**
     * Registers a callback for state change events
     * @param callback The function to call when state changes
     */
    onStateChange(callback: (sender: ProgressBar, args: EventArgs) => void): void {
        this.stateChangeCallback = callback;
        
        // Override the setState method to fire the callback
        const originalSetState = this.setState.bind(this);
        this.setState = (state: any): void => {
            originalSetState(state);
            if (this.stateChangeCallback) {
                this.stateChangeCallback(this, new EventArgs(this));
            }
        };
    }

    // State methods implementation
    idleupState(): void {
        if (this._backgroundRect) {
            this._backgroundRect.fill('#FFF4E0').stroke({ color: '#FFD699', width: 1 });
        }
        if (this._progressRect) {
            this._progressRect.fill('#FFAB5B');
        }
        this.update();
    }

    idledownState(): void {
        if (this._backgroundRect) {
            this._backgroundRect.fill('#FFE5B4').stroke({ color: '#FFD699', width: 1 });
        }
        if (this._progressRect) {
            this._progressRect.fill('#FF8C00');
        }
        this.update();
    }

    pressedState(): void {
        if (this._backgroundRect) {
            this._backgroundRect.fill('#FFD699').stroke({ color: '#FFB84D', width: 1 });
        }
        if (this._progressRect) {
            this._progressRect.fill('#FF8C00');
        }
        this.update();
    }

    pressReleaseState(): void {
        this.idleupState();
    }

    hoverState(): void {
        if (this._backgroundRect) {
            this._backgroundRect.fill('#FFEDCC').stroke({ color: '#FFB84D', width: 1 });
        }
        if (this._progressRect) {
            this._progressRect.fill('#FF9E4F');
        }
        this.update();
    }

    hoverPressedState(): void {
        this.pressedState();
    }

    pressedoutState(): void {
        this.idleupState();
    }

    moveState(): void {
        if (this._backgroundRect) {
            this._backgroundRect.fill('#FFF4E0').stroke({ color: '#FFB84D', width: 1, dasharray: '4,2' });
        }
        if (this._progressRect) {
            this._progressRect.fill('#FFAB5B').opacity(0.8);
        }
        this.update();
    }

    keyupState(keyEvent?: KeyboardEvent): void {
        this.idleupState();
        
        if (keyEvent && (keyEvent.key === 'ArrowRight')) {
            this.increment();
        } else if (keyEvent && (keyEvent.key === 'ArrowLeft')) {
            this.incrementBy(-this._incrementValue);
        }
    }
}

export { ProgressBar, ProgressIncrementEventArgs };

