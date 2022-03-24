module.exports = {
  plugins: [
    {
      resolve: "@raae/gatsby-source-youtube-oembed",
      options: {
        youTubeIds: [
          "Bk1jonYPFD4",
          "TzJfepDjpzM",
          "UsSJ_QNp6uo",
          "TX5XPuHhz9o",
        ],
      },
    },
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
  ],
};
