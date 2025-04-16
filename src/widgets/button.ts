// importing local code, code we have written
import {IdleUpWidgetState, PressedWidgetState } from "../core/ui";
import {Window, Widget, RoleType, EventArgs} from "../core/ui";
// importing code from SVG.js library
import {Rect, Text, Box} from "../core/ui";

class Button extends Widget{
    private _rect: Rect;
    private _text: Text;
    private _input: string;
    private _fontSize: number;
    private _text_y: number;
    private _text_x: number;
    private defaultText: string= "Button";
    private defaultFontSize: number = 18;
    private defaultWidth: number = 80;
    private defaultHeight: number = 30;

    constructor(parent:Window){
        super(parent);
        // set defaults
        this.height = this.defaultHeight;
        this.width = this.defaultWidth;
        this._input = this.defaultText;
        this._fontSize = this.defaultFontSize;
        // set Aria role
        this.role = RoleType.button;
        // render widget
        this.render();
        // set default or starting state
        this.setState(new IdleUpWidgetState());
        // prevent text selection
        this.selectable = false;
    }

    set fontSize(size:number){
        this._fontSize= size;
        this.update();
    }

    private positionText(){
        let box:Box = this._text.bbox();
        // in TS, the prepending with + performs a type conversion from string to number
        this._text_y = (+this._rect.y() + ((+this._rect.height()/2)) - (box.height/2));
        this._text.x(+this._rect.x() + 4);
        if (this._text_y > 0){
            this._text.y(this._text_y);
        }
    }
    
    render(): void {
        this._group = (this.parent as Window).window.group();
        this._rect = this._group.rect(this.width, this.height);
        this._rect.stroke("black");
        this._text = this._group.text(this._input);
        // Set the outer svg element 
        this.outerSvg = this._group;
        // Add a transparent rect on top of text to 
        // prevent selection cursor and to handle mouse events
        let eventrect = this._group.rect(this.width, this.height).opacity(0).attr('id', 0);

        // register objects that should receive event notifications.
        // for this widget, we want to know when the group or rect objects
        // receive events
        this.registerEvent(eventrect);
    }

    override update(): void {
        if(this._text != null)
            this._text.font('size', this._fontSize);
            this._text.text(this._input);
            this.positionText();

        if(this._rect != null)
            this._rect.fill(this.backcolor);
        
        super.update();
    }
    
    pressReleaseState(): void{

        if (this.previousState instanceof PressedWidgetState)
            this.raise(new EventArgs(this));
    }
    
    private clickCallback: ((sender: Button, args: EventArgs) => void) | null = null;

    //TODO: implement the onClick event using a callback passed as a parameter
    onClick(callback: (sender: Button, args: EventArgs) => void): void {
        this.clickCallback = callback;
    
        const originalRaise = this.raise.bind(this);
        this.raise = (args: EventArgs): void => {
            originalRaise(args);
            if (this.previousState instanceof PressedWidgetState && this.clickCallback) {
                this.clickCallback(this, args);
            }
        };
    }

    
    //TODO: give the states something to do! Use these methods to control the visual appearance of your
    //widget
    idleupState(): void {
        this.backcolor = "#3498db"; // Ultra Blue
        this._rect.stroke({ color: "#2980b9", width: 2 }); // Darker blue border
        this._rect.radius(8); 
        this._text.fill("#ffffff"); // White text
        this.update();
    }
    idledownState(): void {
        this.backcolor = "#e0e0e0"; // Grey
        this._rect.stroke({ color: "#000000", width: 1 });
        this._text.fill("#000000");
        this.update();
    }
    pressedState(): void {
        this.backcolor = "#c0c0c0"; // Darker gray for pressed state
        this._rect.stroke({ color: "#000000", width: 1.5 }); // Increase border thickness
        this._text.fill("#000000");
        this._text.dmove(1, 1); // Moves text
        this.update();
    }
    hoverState(): void {
        this.backcolor = "#f8f8f8"; // Lighter than idle
        this._rect.stroke({ color: "#4080ff", width: 1.5 }); // Blue highlight
        this._text.fill("#4080ff"); // Blue text
        this.update();
    }
    hoverPressedState(): void {
        this.backcolor = "#d0d0d0"; // Darker gray 
        this._rect.stroke({ color: "#4080ff", width: 1.5 }); // Blue highlight
        this._text.fill("#4080ff");
        // Move text
        this._text.dmove(1, 1);
        this.update();
    }
    pressedoutState(): void {
        this.backcolor = "#f0f0f0"; // Back to idle color
        this._rect.stroke({ color: "#000000", width: 1 });
        this._text.fill("#000000");
        this.update();
    }
    moveState(): void {
        this.backcolor = "#e8e8e8";
        this._rect.stroke({ color: "#000000", width: 1, dasharray: '4,2' }); // Dashed border
        this._text.fill("#808080"); // Gray text
        this.update();
    }
    keyupState(keyEvent?: KeyboardEvent): void {
        // Check if Enter or Space key was pressed (common accessibility pattern)
        if (keyEvent && (keyEvent.key === 'Enter' || keyEvent.key === ' ')) {
            this.pressedState();
            
            // Trigger the click event
            setTimeout(() => {
                this.idleupState();
                this.raise(new EventArgs(this));
                if (this.clickCallback) {
                    this.clickCallback(this, new EventArgs(this));
                }
            }, 100);
        } else {
            this.idleupState(); // Return to default state
        }
    }

    get label(): string {
        return this._input;
    }

    set label(value: string) {
        this._input = value;
        this.update();
    }

    get buttonWidth(): number {
        return this.width;
    }
    
    set buttonWidth(value: number) {
        this.width = value;
        // Update rectangle
        if (this._rect) {
            this._rect.width(value);
            this.positionText();
        }
    }

    get buttonHeight(): number {
        return this.height;
    }
    
    set buttonHeight(value: number) {
        this.height = value;
        // Update rectangle
        if (this._rect) {
            this._rect.height(value);
            this.positionText();
        }
    }
}

export {Button}