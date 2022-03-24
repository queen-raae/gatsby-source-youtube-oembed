import React from "react";
import { graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";

const IndexPage = ({ data }) => {
  const { allYouTube } = data;
  return (
    <main>
      <header>
        <h1>
          <span role="img" aria-label="Party popper emoji">
            🎉&nbsp;
          </span>
          gatsby-source-youtube-oembed
          <span role="img" aria-label="Party popper emoji">
            &nbsp;🎉
          </span>
        </h1>
        <div>
          {allYouTube.nodes.map((video) => {
            const { youTubeId, oEmbed, thumbnail } = video;
            return (
              <p key={youTubeId}>
                <a href={oEmbed.url}>
                  <GatsbyImage
                    aspectRatio={16 / 9}
                    image={thumbnail.gatsbyImage}
                    alt={oEmbed.title}
                  />
                </a>
              </p>
            );
          })}
        </div>
      </header>
    </main>
  );
};

export const query = graphql`
  {
    allYouTube {
      nodes {
        youTubeId
        oEmbed {
          title
          url
        }
        thumbnail {
          gatsbyImage(
            layout: FIXED
            fit: COVER
            cropFocus: CENTER
            aspectRatio: 1.77777778
            width: 480
          )
        }
      }
    }
  }
`;

export default IndexPage;
