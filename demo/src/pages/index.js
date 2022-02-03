import React from "react";
import { graphql } from "gatsby";

const IndexPage = ({ data }) => {
  return (
    <main>
      <header>
        <h1>
          <span role="img" aria-label="Party popper emoji">
            🎉&nbsp;
          </span>
          Awsome plugin demo
          <span role="img" aria-label="Party popper emoji">
            &nbsp;🎉
          </span>
        </h1>
        <pre>{JSON.stringify(data, null, 4)}</pre>
      </header>
    </main>
  );
};

export const query = graphql`
  {
    allYouTube {
      nodes {
        oEmbed {
          title
        }
      }
    }
  }
`;

export default IndexPage;
