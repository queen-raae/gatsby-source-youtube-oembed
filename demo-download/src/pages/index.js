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
            console.log(video);
            const gatsbyImage = getImage(thumbnail);
            return (
              <p key={youTubeId}>
                <a href={oEmbed.url}>
                  <GatsbyImage
                    aspectRatio={16 / 9}
                    image={gatsbyImage}
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
          childImageSharp {
            gatsbyImageData(
              width: 480
              transformOptions: { fit: COVER, cropFocus: CENTER }
              aspectRatio: 1.77777778
            )
          }
        }
      }
    }
  }
`;

export default IndexPage;
