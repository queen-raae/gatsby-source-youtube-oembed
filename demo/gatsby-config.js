module.exports = {
  plugins: [
    {
      resolve: "@raae/gatsby-source-youtube-oembed",
      options: {
        youTubeIds: ["Bk1jonYPFD4", "TzJfepDjpzM"],
      },
    },
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
  ],
};
