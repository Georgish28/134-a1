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
        this.role = RoleType.button;
        this.render();
        this.setState(new IdleUpWidgetState());
        this.selectable = false;
    }

    set fontSize(size:number){
        this._fontSize= size;
        this.update();
    }

    private positionText(){
        let box:Box = this._text.bbox();
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
        this.outerSvg = this._group;

        let eventrect = this._group.rect(this.width, this.height).opacity(0).attr('id', 0);
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

    idleupState(): void {
        this.backcolor = "#FF8700"; // Papaya Orange
        this._rect.stroke({ color: "#CC6A00", width: 2 }); // Slightly darker orange border
        this._rect.radius(8);
        this._text.fill("#ffffff"); // White text
        this.update();
    }
    idledownState(): void {
        this.backcolor = "#FFD5B0"; // Soft orange-tint background
        this._rect.stroke({ color: "#CC6A00", width: 1 });
        this._text.fill("#000000");
        this.update();
    }
    pressedState(): void {
        this.backcolor = "#CC6A00"; // Darker orange for pressed
        this._rect.stroke({ color: "#994D00", width: 1.5 });
        this._text.fill("#ffffff");
        this._text.dmove(1, 1);
        this.update();
    }
    hoverState(): void {
        this.backcolor = "#FFA347"; // Lighter papaya orange
        this._rect.stroke({ color: "#CC6A00", width: 1.5 });
        this._text.fill("#ffffff");
        this.update();
    }
    hoverPressedState(): void {
        this.backcolor = "#CC6A00";
        this._rect.stroke({ color: "#994D00", width: 1.5 });
        this._text.fill("#ffffff");
        this._text.dmove(1, 1);
        this.update();
    }
    pressedoutState(): void {
        this.backcolor = "#FFD5B0";
        this._rect.stroke({ color: "#CC6A00", width: 1 });
        this._text.fill("#000000");
        this.update();
    }
    moveState(): void {
        this.backcolor = "#FFB270"; // Soft papaya-orange shade
        this._rect.stroke({ color: "#994D00", width: 1, dasharray: '4,2' });
        this._text.fill("#662F00");
        this.update();
    }
    keyupState(keyEvent?: KeyboardEvent): void {
        if (keyEvent && (keyEvent.key === 'Enter' || keyEvent.key === ' ')) {
            this.pressedState();
            setTimeout(() => {
                this.idleupState();
                this.raise(new EventArgs(this));
                if (this.clickCallback) {
                    this.clickCallback(this, new EventArgs(this));
                }
            }, 100);
        } else {
            this.idleupState();
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
        if (this._rect) {
            this._rect.height(value);
            this.positionText();
        }
    }
}

export {Button}