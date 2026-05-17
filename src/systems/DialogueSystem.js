window.Purrdom = window.Purrdom || {};

(function defineDialogueSystem(P) {
  class DialogueSystem {
    constructor(element) {
      this.element = element;
      this.timer = 0;
    }

    say(message, seconds = 4) {
      this.element.textContent = message;
      this.element.classList.remove("hidden");
      this.timer = seconds;
    }

    update(dt) {
      if (this.timer <= 0) return;
      this.timer -= dt;
      if (this.timer <= 0) {
        this.element.classList.add("hidden");
      }
    }
  }

  P.DialogueSystem = DialogueSystem;
})(window.Purrdom);
