function Toggle(tagName, id, label) {   
    this.tagName = tagName;
    this.id = id;
    this.label = label;
    this.element = {};

    this.show = function show() {
        return `<input type="${this.tagName}" id="${this.id}" checked>
         <label for="${this.id}">${this.label}</label>&nbsp;&nbsp;`;
    }

    this.getElement = function getElement(name) {
        return document.getElementById(name);
    }

    this.getStatus = function getStatus(name) {
        return document.getElementById(name).checked;
    }

    this.setStatus = function setStatus(name, val) {
        document.getElementById(name).checked = val;
    }

}
