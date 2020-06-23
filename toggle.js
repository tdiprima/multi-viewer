// Checkbox toggle
function Toggle(tagName, id, label) {   
    this.tagName = tagName;
    this.id = id;
    this.label = label;

    this.show = function show() {
        return `<input type="${this.tagName}" id="${this.id}" checked>
         <label for="${this.id}">${this.label}</label>&nbsp;`;
    }

}
// Font-awesome style toggle
function Widget(widget, id, color) {
    this.widget = widget;
    this.id = id;
    this.color = color;

    this.show = function show() {
        return `<div id='${this.id}' class='widget'><i class=\"${this.widget}"\" style='color: ${this.color};'></i>&nbsp;</div>`;
    }
}