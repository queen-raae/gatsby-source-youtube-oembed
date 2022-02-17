# @raae/gatsby-source-youtube-oembed

_Source YouTube information without an API key using the oEmbed endpoint 📺_

&nbsp;

## A message or two from Queen Raae 👑

### 1-on-1 Emergency Gatsby Call

Are you stuck on a reef in the sharky waters around the Gatsby islands? Check out [1-on-1 Emergency Gatsby Call](https://queen.raae.codes/gatsby-emergency/?utm_source=readme&utm_campaign=source-youtube-oembed) with Queen Raae to get friendly advice you can put into action immediately from a seasoned Gatsby developer.

### Stay updated and get the most out of Gatsby

Learn how to get the most out of Gatsby and **stay updated** on the plugin by [subscribing](https://queen.raae.codes/emails/?utm_source=readme&utm_campaign=source-youtube-oembed) to daily emails from Queen Raae and Cap'n Ola.

&nbsp;

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
