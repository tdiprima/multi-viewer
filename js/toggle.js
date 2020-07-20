/**
 * Checkbox toggle
 * @param tagName
 * @param id
 * @param label
 * @constructor
 */
function Toggle(tagName, id, label) {
    this.tagName = tagName;
    this.id = id;
    this.label = label;

    this.show = function show() {
        return `<input type="${this.tagName}" id="${this.id}" checked>
         <label for="${this.id}">${this.label}</label>&nbsp;&nbsp;`;
    }

}
