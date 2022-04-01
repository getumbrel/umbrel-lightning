<template>
  <div class="w-100 container">
    <div class="row mt-1 mb-3">
      <template v-for="(word, index) in words">
        <div :key="index" class="col-3 d-flex align-items-center mt-2 mb-2">
          <b-input
            id="input-sats"
            class="mb-1 neu-input"
            :class="{
              error: inputWords[index] && inputWords[index] !== words[index]
            }"
            type="text"
            size="lg"
            min="1"
            lazy
            autocomplete="off"
            :placeholder="'Word ' + (index + 1)"
            v-model="inputWords[index]"
          ></b-input>
        </div>
      </template>
    </div>
    <div
      class="d-flex flex-column align-items-center justify-content-center w-100"
    >
      <p v-if="!valid" class="text-danger">The seed you input is not valid!</p>
      <a href="#" class="text-center mb-3" @click="prevStep">
        Back
      </a>
      <div class="d-flex justify-content-end">
        <b-button variant="success" class="px-3" @click="validateAndNext"
          >Next</b-button
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    words: Array,
    nextStep: Function,
    prevStep: Function
  },
  data() {
    return {
      inputWords: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      valid: true
    };
  },
  methods: {
    validateAndNext() {
      this.valid = true;
      for (let i = 0; i < this.inputWords.length; i++) {
        if (this.inputWords[i] !== this.words[i]) {
          this.valid = false;
        }
      }
      if (this.valid) {
        this.nextStep();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.error {
  border: 1px solid red;
}
.word-count {
  height: 3rem;
  width: 3rem;
  line-height: 3rem;
  border-radius: 50%;
}
</style>
