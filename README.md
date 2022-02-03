# @raae/gatsby-source-youtube-oembed

> Source YouTube information without an API key using the oEmbed endpoint 📺

## How to install

`npm install @raae/gatsby-source-youtube-oembed`

or

`yarn add @raae/gatsby-source-youtube-oembed`

## How to use

```
module.exports = {
  plugins: [
    `@raae/gatsby-source-youtube-oembed`
  ],
}
```

## Plugin Options

### YouTube Ids

Add the YouTube ids for the videos you would like to source!
**Type:** An array of YouTube ids
**Example:** `["Bk1jonYPFD4", "TzJfepDjpzM"]`
**Default:** `[]`

```
// gatsby.config.js

module.exports = {
  plugins: [
    {
      resolve: "@raae/gatsby-source-youtube-oembed",
      options: {
        youTubeIds: ["Bk1jonYPFD4", "TzJfepDjpzM"],
      },
    },
  ],
};
```

## Questions, Feedback and Suggestions

If you have any questions, feedback or suggestions head on over to [discussions](https://github.com/queen-raae/gatsby-source-youtube-oembed/discussions).

## Found a bug?

If you find a bug please open an [issue](https://github.com/queen-raae/gatsby-source-youtube-oembed/issues) and/or create a pull request to fix it.
