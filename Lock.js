function Lock(tagName, id, classList, style) {
    this.tagName = tagName;
    this.id = id;
    this.classList = classList;
    this.style = style;
    this.locked = false;

    this.show = function show() {
        return `<${this.tagName} id="${this.id}" class="${this.classList}" style="${this.style}"></${this.tagName}>`;
    }

    this.isLocked = function isLocked() {
        return this.locked;
    }

    this.setLocked = function setLocked(val) {
        this.locked = val;
    }
}
