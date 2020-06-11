function Lock(tagName, id, classList, style) {
    this.tagName = tagName;
    this.id = id;
    this.classList = classList;
    this.style = style;
    this.locked = false;

    this.show = function show() {
        var html = "";
        html = `<${this.tagName} id="${this.id}" class="${this.classList}" style="${this.style}"></${this.tagName}>`;
        console.log("html", html)
        return html;
    }

    this.isLocked = function isLocked() {
        return this.locked;
    }

    this.setLocked = function setLocked(val) {
        this.locked = val;
    }
}
