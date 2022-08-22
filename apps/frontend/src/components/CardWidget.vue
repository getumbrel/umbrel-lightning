<template>
  <b-card
    header-tag="header"
    footer-tag="footer"
    no-body
    class="mb-4 card-custom"
  >
    <div class="card-custom-loading-bar" v-if="loading"></div>
    <!-- <template v-slot:header></template> -->
    <div>
      <div class="card-custom-header py-4 px-3 px-lg-4" v-if="header">
        <div class="d-flex w-100 justify-content-between align-items-center">
          <h6 class="mb-0 font-weight-normal text-muted">{{ header }}</h6>
          <status
            v-if="!!status"
            :variant="status.variant"
            :blink="!!status.blink"
            >{{ status.text }}</status
          >
          <!-- Only render this div if either there's a menu or a  -->
          <!-- header on the right, else it causes spacing issues -->
          <div
            v-if="
              (!!$slots['header-right'] && !!$slots['header-right'][0]) ||
                (!!$slots['menu'] && !!$slots['menu'][0])
            "
          >
            <slot name="header-right"></slot>
          </div>
        </div>
      </div>
      <div class="card-custom-body">
        <div class="card-app-info px-3 px-lg-4" v-if="title || subTitle">
          <div class="d-flex w-100 justify-content-between align-items-center mb-4">
            <div>
              <div>
                <h3 v-if="title" class="mb-1">{{ title }}</h3>
                <h3 class="mb-1" v-else>
                  <slot name="title"></slot>
                </h3>
                <p class="text-muted mb-0" v-if="subTitle">{{ subTitle }}</p>
              </div>
            </div>
            <img :alt="header" :src="require(`@/assets/${icon}`)" v-if="icon" />
            <slot name="icon-replacement"></slot>
          </div>
        </div>
        <slot></slot>
      </div>
    </div>
    <!-- <template v-slot:footer></template> -->
  </b-card>
</template>

<script>
import Status from "@/components/Utility/Status";

export default {
  data() {
    return {};
  },
  props: {
    header: String,
    status: Object, // {text, variant, blink}
    title: String,
    subTitle: String,
    icon: String,
    loading: Boolean,
  },
  computed: {},
  methods: {},
  components: {
    Status,
  },
};
</script>

<style lang="scss" scoped></style>
