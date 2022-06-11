module.exports = {
  chainWebpack: config => {
    config.plugin("html").tap(args => {
      args[0].template = "./public/index.html";
      return args;
    });
    // to disable conversation of, say, translate3d(0, 0, 0) to translateZ(0)
    // as Safari cannot render translateZ to translate3d transitions
    if (process.env.NODE_ENV === "production") {
      config.plugin("optimize-css").tap(args => {
        args[0].cssnanoOptions.preset[1].reduceTransforms = false;
        return args;
      });
    }
  }
};
