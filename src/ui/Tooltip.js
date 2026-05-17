window.Purrdom = window.Purrdom || {};

(function defineTooltip(P) {
  class Tooltip {
    constructor(element) {
      this.element = element;
      this.text = "";
    }

    show(text) {
      if (this.text === text && !this.element.classList.contains("hidden")) return;
      this.text = text;
      this.element.textContent = text;
      this.element.classList.remove("hidden");
    }

    hide() {
      this.text = "";
      this.element.classList.add("hidden");
    }
  }

  P.Tooltip = Tooltip;
})(window.Purrdom);
