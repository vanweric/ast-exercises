module.exports = {
  webpack: {
    configure: (webpackConfig, { env }) => {
      const oneOfRule =
        webpackConfig.module.rules.find(r => r.oneOf != null);

      oneOfRule.oneOf = [
        {
          test: /\.(txt|md)$/,
          type: "asset/inline",
          generator: {
            dataUrl: content => content.toString()
          }
        },
        ...oneOfRule.oneOf,
      ];

      return webpackConfig;
    },
  },
};
