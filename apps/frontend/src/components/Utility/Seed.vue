<template>
  <div class="w-100 container mt-1 mb-3 ml-4 ml-sm-2 ml-md-2">
    <div class="row">
      <template v-for="(word, index) in words">
        <div
          :key="index"
          class="col-12 col-sm-6 col-lg-3 d-flex align-items-center my-2"
        >
          <div class="mr-2 select-none">
            <div
              class="word-count d-flex align-items-center justify-content-center mx-auto bg-primary text-white text-center"
            >
              {{ index + 1 }}
            </div>
          </div>
          <h5 class="mb-0">{{ word }}</h5>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    words: Array
  }
};
</script>

<style lang="scss" scoped>
.select-none {
  user-select: none;
  -webkit-user-select: none;
}

.word-count {
  height: 2rem;
  width: 2rem;
  line-height: 2rem;
  border-radius: 50%;
  font-size: 0.85rem;
}
</style>
