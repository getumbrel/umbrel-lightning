<template>
  <div class="w-100 container">
    <div class="row mt-1 mb-3">
      <template v-for="(word, index) in words">
        <div
          :key="index"
          class="col-12 col-sm-6 col-lg-3 d-flex align-items-center mt-2 mb-2"
        >
          <b-input
            class="mb-1 verify-seed-input"
            :class="{
              'border-danger': inputWords[index] && inputWords[index] !== words[index],
              'border-success': inputWords[index] && inputWords[index] === words[index]
            }"
            type="text"
            size="md"
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
      <p v-if="!valid" class="text-danger">Incorrect secret words. Please try again.</p>
      <a href="#" class="text-center mb-3 text-uppercase" @click="prevStep">
        Back
      </a>
      <div class="d-flex justify-content-end">
        <b-button variant="success" class="px-4" @click="validateAndNext"
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
.word-count {
  height: 3rem;
  width: 3rem;
  line-height: 3rem;
  border-radius: 50%;
}

.verify-seed-input {
  font-weight: 700;
  color: #141821;
  border-radius: 4px;
  background: #f8f8f8;

  &::placeholder {
    font-weight: 400 !important;
    color: #b5b5b5;
  }
}

.verify-seed-input:focus {
  border: 1px solid #5351fb;
  box-shadow: none;
}
</style>
