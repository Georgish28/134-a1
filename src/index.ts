import { Window } from "./core/ui";
import { Button } from "./widgets/button";
import { ProgressBar } from "./widgets/progressbar";
import { Heading } from "./widgets/heading";
import { CheckBox, CheckboxStateEventArgs } from "./widgets/checkbox";
import { RadioButton, RadioButtonStateEventArgs } from "./widgets/radiobutton";
import { ScrollBar } from "./widgets/scrollbar";
import { Slider, SliderValueEventArgs } from "./widgets/slider";

// Clear any existing elements that might be causing duplication
// If there's an existing way to clear the window, use that instead
// For example: w.clear(); 

// Create fresh window
let w = new Window(window.innerHeight - 10, '100%');

// Heading widget - just the main title
let lblHeading = new Heading(w);
lblHeading.text = "Jenson first to press the drs";
lblHeading.tabindex = 1;
lblHeading.fontSize = 16;
lblHeading.move(20, 35);

// Button widget
let btn = new Button(w);
btn.tabindex = 2;
btn.fontSize = 14;
btn.label = "Click Me!";
btn.buttonHeight = 50;
btn.buttonWidth = 100;
btn.move(30, 100);

// ProgressBar widget 
let progBar = new ProgressBar(w);
progBar.value = 0;
progBar.move(30, 170);
// Use appropriate method to set width if it exists on ProgressBar
if ('setWidth' in progBar) {
    (progBar as any).setWidth(200);
}

// Progress label - Only create this once
let lblProgress = new Heading(w);
lblProgress.text = "Progress: 0%";
lblProgress.tabindex = 4;
lblProgress.fontSize = 14;
lblProgress.move(30, 197);

// Event handling for progress bar
progBar.onIncrement((sender, args) => {
    console.log(`Progress incremented: ${args.previousValue}% -> ${args.currentValue}%`);
    lblProgress.text = `Progress: ${progBar.value}%`;
});

// Button click increments progress bar
btn.onClick((sender, args) => {
    console.log('Button was clicked!');
    progBar.increment();
});

// CheckBox widget - ONLY create this once
let checkBox = new CheckBox(w);
checkBox.label = "Accept Terms"; // This is the only place "Accept Terms" should appear
checkBox.fontSize = 14;
checkBox.move(30, 275);

// CheckBox label
let lblCheckBox = new Heading(w);
lblCheckBox.text = "Checkbox Text: Accept Terms";
lblCheckBox.tabindex = 5;
lblCheckBox.fontSize = 14;
lblCheckBox.move(30, 300);

// Event handling for checkbox
checkBox.onCheckedChange((sender, args) => {
    console.log(`Checkbox state changed: ${args.isChecked ? 'Checked' : 'Unchecked'}`);
    lblCheckBox.text = `Checkbox Text: ${args.isChecked ? 'Accept Terms' : 'Terms not accepted'}`;
});

// RadioButton widget 
let radio = new RadioButton(w);
radio.labels = ["DRS Enabled", "DRS Disabled", "Auto"];
radio.itemCount = 3;
radio.move(30, 340);

// Event handling for radio buttons
radio.onSelectionChange((sender, args) => {
    console.log(`Selected option: ${args.selectedLabel} (index ${args.selectedIndex})`);
});

// ScrollBar widget
let scrollBar = new ScrollBar(w);
scrollBar.scrollbarHeight = 200;
scrollBar.move(window.innerWidth - 50, 80);

// Event handling for scrollbar
scrollBar.onThumbMove = (direction) => {
    console.log(`Thumb moved: ${direction}, position: ${scrollBar.thumbPosition}px`);
};

// Papaya-themed Slider widget - Create this ONLY once
let slider = new Slider(w);
slider.setWidth(200);
slider.move(30, window.innerHeight - 70);
slider.value = 40; // Set to 40% to match the image
slider.trackColor = "#F58020"; // Papaya orange
slider.thumbColor = "#FFC87C"; // Lighter papaya

// Slider title
let lblSliderTitle = new Heading(w);
lblSliderTitle.text = "Papaya Slider";
lblSliderTitle.fontSize = 14;
lblSliderTitle.move(30, window.innerHeight - 90);

// Slider value label
let lblSlider = new Heading(w);
lblSlider.text = `Slider Value: ${slider.value}%`;
lblSlider.fontSize = 14;
lblSlider.move(240, window.innerHeight - 70);

// Event handling for slider
slider.onValueChange((sender, args) => {
    console.log(`Slider value changed: ${args.previousValue}% -> ${args.currentValue}%`);
    lblSlider.text = `Slider Value: ${args.currentValue}%`;
});