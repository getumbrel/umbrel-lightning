<template>
  <div
    class="qr-container"
    :style="{
      width: `${size + quietZone * 2}px`,
      height: `${size + quietZone * 2}px`,
      padding: `${quietZone}px`
    }"
    @click="$emit('click')"
  >
    <div class="qr-frame" :style="{ width: `${size}px`, height: `${size}px` }">
      <!-- Popup umbrel logo in the middle of QR code -->
      <transition name="qr-logo-popup" appear>
        <img
          v-show="showLogo"
          src="@/assets/umbrel-qr-icon.svg"
          class="qr-logo"
        />
      </transition>

      <!-- QR Code element -->
      <qrcode-vue
        :value="value"
        :size="size"
        :level="level"
        foreground="#000000"
        background="#ffffff"
        renderAs="svg"
        class="d-flex justify-items-center qr-image"
      ></qrcode-vue>
    </div>
  </div>
</template>

<script>
import QrcodeVue from "qrcode.vue";

export default {
  props: {
    size: {
      type: Number,
      default: 200
    },
    level: {
      type: String,
      default: "H"
    },
    quietZone: {
      type: Number,
      default: 12
    },
    value: String,
    showLogo: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {};
  },
  computed: {},
  methods: {},
  components: {
    QrcodeVue
  }
};
</script>

<style lang="scss" scoped>
// Transition for umbrel logo popping up on QR
.qr-logo-popup-enter-active,
.qr-logo-popup-leave-active {
  &.qr-logo {
    transition: transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
}

.qr-logo-popup-enter {
  &.qr-logo {
    transform: translate3d(-50%, -50%, 0) scale(0);
    opacity: 0;
  }
}

.qr-logo-popup-enter-to,
.qr-logo-popup-leave,
.qr-logo-popup-leave-to {
  &.qr-logo {
    transform: translate3d(-50%, -50%, 0) scale(1);
    opacity: 1;
  }
}

.qr-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 8px;
  box-sizing: border-box;
  line-height: 0;
}
.qr-frame {
  position: relative;
  flex: 0 0 auto;
}
.qr-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 25%;
  height: 25%;
  transform: translate3d(-50%, -50%, 0) scale(1);
}
</style>
