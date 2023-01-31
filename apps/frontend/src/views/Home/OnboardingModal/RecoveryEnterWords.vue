<template>
  <div class="d-flex align-items-center w-100 flex flex-column text-center p-3 pb-4">
    <h3>Enter your secret words</h3>
    <p>
      Enter your 24 secret words in the exact order to start the recovery process
    </p>
    <b-row>
      <template v-for="(x, index) in Array(24)">
        <div
          :key="index"
          class="col-12 col-sm-6 col-lg-3 d-flex align-items-center mt-2 mb-2"
        >
          <b-input
            class="mb-1 verify-seed-input"
            type="text"
            size="md"
            min="1"
            lazy
            autocomplete="off"
            :placeholder="'Word ' + (index + 1)"
            v-model="recoveryWords[index]"
          ></b-input>
        </div>
      </template>
    </b-row>
    <div class="mt-4 mb-3">
      <a href="#"
        class="text-center text-uppercase"
        :class="{'disabled-link': loading}"
        @click.prevent="onBack"
      >
        Back
      </a>
    </div>
    <div>
      <b-button variant="success px-4"
        @click="onNext"
        :class="{'fade-in-out': loading}"
        :disabled="disabled"
      >Next</b-button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    disabled: Boolean,
    loading: Boolean,
    onBack: Function,
    onNext: Function,
    recoveryWords: Array,
  },
};
</script>

<style lang="scss" scoped></style>