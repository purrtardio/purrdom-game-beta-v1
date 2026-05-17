window.Purrdom = window.Purrdom || {};

(function defineMobileControls(P) {
  class MobileControls {
    constructor(game, root) {
      this.game = game;
      this.root = root;
      this.activePointerId = null;
      this.render();
      this.bind();
      this.update();
    }

    render() {
      this.root.innerHTML = `
        <div class="mobile-joystick" data-mobile-joystick aria-label="Move">
          <div class="mobile-joystick-base">
            <div class="mobile-joystick-knob" data-mobile-joystick-knob></div>
          </div>
        </div>
        <div class="mobile-action-dock">
          <div class="mobile-more-menu" data-mobile-more-menu>
            <button class="mobile-action-button" type="button" data-mobile-key="L">Ranks</button>
            <button class="mobile-action-button" type="button" data-mobile-key="T">Treasury</button>
            <button class="mobile-action-button" type="button" data-mobile-key="B">Mining</button>
            <button class="mobile-action-button" type="button" data-mobile-key="R">Reset</button>
          </div>
          <button class="mobile-action-button primary" type="button" data-mobile-key="E">Interact</button>
          <button class="mobile-action-button" type="button" data-mobile-key="M">Map</button>
          <button class="mobile-action-button" type="button" data-mobile-key="I">Gear</button>
          <button class="mobile-action-button" type="button" data-mobile-more aria-expanded="false">More</button>
        </div>
      `;
      this.joystick = this.root.querySelector("[data-mobile-joystick]");
      this.knob = this.root.querySelector("[data-mobile-joystick-knob]");
      this.moreButton = this.root.querySelector("[data-mobile-more]");
    }

    bind() {
      this.joystick.addEventListener("pointerdown", (event) => this.startJoystick(event));
      this.joystick.addEventListener("pointermove", (event) => this.moveJoystick(event));
      this.joystick.addEventListener("pointerup", (event) => this.endJoystick(event));
      this.joystick.addEventListener("pointercancel", (event) => this.endJoystick(event));
      this.joystick.addEventListener("lostpointercapture", () => this.clearJoystick());

      this.root.querySelectorAll("[data-mobile-key]").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          this.root.classList.remove("is-menu-open");
          this.moreButton.setAttribute("aria-expanded", "false");
          this.game.input.triggerVirtualKey(button.dataset.mobileKey);
        });
      });

      this.moreButton.addEventListener("click", (event) => {
        event.preventDefault();
        const open = !this.root.classList.contains("is-menu-open");
        this.root.classList.toggle("is-menu-open", open);
        this.moreButton.setAttribute("aria-expanded", String(open));
      });
    }

    startJoystick(event) {
      event.preventDefault();
      this.activePointerId = event.pointerId;
      this.joystick.setPointerCapture(event.pointerId);
      this.moveJoystick(event);
    }

    moveJoystick(event) {
      if (this.activePointerId !== event.pointerId) return;
      event.preventDefault();
      const rect = this.joystick.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const max = rect.width * 0.34;
      const rawX = event.clientX - centerX;
      const rawY = event.clientY - centerY;
      const length = Math.sqrt(rawX * rawX + rawY * rawY);
      const scale = length > max ? max / length : 1;
      const knobX = rawX * scale;
      const knobY = rawY * scale;

      this.knob.style.transform = `translate(${knobX}px, ${knobY}px)`;
      this.game.input.setVirtualMovement(rawX / max, rawY / max);
    }

    endJoystick(event) {
      if (this.activePointerId !== event.pointerId) return;
      event.preventDefault();
      this.clearJoystick();
    }

    clearJoystick() {
      this.activePointerId = null;
      this.knob.style.transform = "translate(0, 0)";
      this.game.input.clearVirtualMovement();
    }

    update() {
      const hasPanel = Boolean(this.game.panelManager && this.game.panelManager.current);
      this.root.classList.toggle("is-panel-open", hasPanel);
      if (hasPanel) {
        this.root.classList.remove("is-menu-open");
        this.moreButton.setAttribute("aria-expanded", "false");
        this.clearJoystick();
      }
    }
  }

  P.MobileControls = MobileControls;
})(window.Purrdom);
