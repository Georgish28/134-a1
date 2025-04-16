import {Window} from "./core/ui"
import {Button} from "./widgets/button"
import {Heading} from "./widgets/heading"


let w = new Window(window.innerHeight-10,'100%');

let lbl1= new Heading(w);
lbl1.text = "Jenson first to press the drs";
lbl1.tabindex = 1;
lbl1.fontSize = 16;
lbl1.move(10,20);

let btn = new Button(w);
btn.tabindex = 2;
btn.fontSize = 14
btn.label = "Click Me!"
btn.buttonHeight = 50
btn.buttonWidth = 100
btn.move(12, 50)

btn.onClick((sender, args) => {
    console.log('Button was clicked!');
    
    lbl1.text = "Button!";
    lbl1.fontSize = 18; 
});
