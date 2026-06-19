<template>
  <span ref="root" class="count-up">
    <span ref="number" class="count-up-number"></span>
    <span v-if="suffix" class="count-up-suffix">{{ suffix }}</span>
    <!-- <small>{{ endVal }}</small> -->
  </span>
</template>

<script>
import { CountUp } from "countup.js";
const typeOf = (type) => (object) =>
  Object.prototype.toString.call(object) === `[object ${type}]`;
const isFunction = typeOf("Function");
export default {
  props: {
    delay: {
      type: Number,
      required: false,
      default: 0,
    },
    value: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      required: false,
    },
    suffix: {
      type: String,
      required: false,
      default: "",
    },
    countOnLoad: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      startVal: 0,
      instance: null,
      resizeObserver: null,
      observedWidth: null,
      firstLoad: true, //used to decide if animate/count on the first mount
    };
  },
  computed: {},
  mounted() {
    const that = this;
    that.create();
    that.observeSize();
  },
  beforeDestroy() {
    const that = this;
    that.destroy();
    that.disconnectSizeObserver();
  },
  methods: {
    create() {
      const that = this;
      if (that.instance) {
        return;
      }
      const dom = that.$refs.number;
      const options = that.options || {};

      if (this.firstLoad) {
        if (this.countOnLoad) {
          this.startVal = 0;
        } else {
          this.startVal = this.value.endVal;
        }
      }
      options.decimalPlaces = this.value.decimalPlaces || 0;

      options.startVal = this.startVal;

      const instance = new CountUp(dom, that.value.endVal, options);
      if (instance.error) {
        // error
        return;
      }
      that.instance = instance;
      if (that.delay < 0) {
        that.fitText();
        that.$emit("ready", instance, CountUp);
        return;
      }
      setTimeout(() => {
        instance.start(() => {
          that.fitText();
          that.$emit("ready", instance, CountUp);
        });
        that.fitText();
        this.firstLoad = false;
      }, that.delay);
    },
    destroy() {
      const that = this;
      that.instance = null;
    },
    printValue(value) {
      const that = this;
      if (that.instance && isFunction(that.instance.printValue)) {
        return that.instance.printValue(value);
      }
    },
    start(callback) {
      const that = this;
      if (that.instance && isFunction(that.instance.start)) {
        return that.instance.start(callback);
      }
    },
    pauseResume() {
      const that = this;
      if (that.instance && isFunction(that.instance.pauseResume)) {
        return that.instance.pauseResume();
      }
    },
    reset() {
      const that = this;
      if (that.instance && isFunction(that.instance.reset)) {
        return that.instance.reset();
      }
    },
    update(newEndVal) {
      const that = this;
      if (that.instance && isFunction(that.instance.update)) {
        const updated = that.instance.update(newEndVal);
        that.fitText();
        return updated;
      }
    },
    observeSize() {
      const root = this.$refs.root;
      const parent = root && root.parentElement;

      if (!parent) {
        return;
      }

      if (window.ResizeObserver) {
        const target = parent.parentElement || parent;
        this.resizeObserver = new window.ResizeObserver(entries => {
          const width = entries[0] && entries[0].contentRect.width;

          if (!width || width === this.observedWidth) {
            return;
          }

          this.observedWidth = width;
          this.fitText();
        });
        this.resizeObserver.observe(target);
      } else {
        window.addEventListener("resize", this.fitText);
      }

      this.fitText();
    },
    disconnectSizeObserver() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
        return;
      }

      window.removeEventListener("resize", this.fitText);
    },
    fitText() {
      this.$nextTick(() => {
        window.requestAnimationFrame(() => {
          const root = this.$refs.root;
          const parent = root && root.parentElement;

          if (!root || !parent) {
            return;
          }

          root.style.fontSize = "";

          const availableWidth = parent.clientWidth;
          const renderedWidth = root.scrollWidth;

          if (
            !availableWidth ||
            !renderedWidth ||
            renderedWidth <= availableWidth
          ) {
            return;
          }

          const fontSize = parseFloat(window.getComputedStyle(root).fontSize);
          const scale = availableWidth / renderedWidth;
          root.style.fontSize = `${Math.max(
            fontSize * scale,
            fontSize * 0.45
          )}px`;
        });
      });
    },
  },
  watch: {
    value: {
      handler(newVal, oldVal) {
        if (newVal.decimalPlaces !== oldVal.decimalPlaces) {
          this.destroy();
          this.startVal = 0;
          this.create();
        } else {
          if (newVal.endVal !== oldVal.endVal) {
            this.update(newVal.endVal);
          }
        }
      },
      deep: true,
    },
  },
  components: {},
};
</script>

<style lang="scss" scoped>
.count-up {
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
  vertical-align: bottom;
  white-space: nowrap;
}

.count-up-number {
  min-width: 0;
}

.count-up-suffix {
  flex: 0 0 auto;
}
</style>
