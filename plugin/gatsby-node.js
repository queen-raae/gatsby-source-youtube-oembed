const axios = require("axios");
const {
  polyfillImageServiceDevRoutes,
  addRemoteFilePolyfillInterface,
} = require("gatsby-plugin-utils/polyfill-remote-file");
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

const IS_PROD = process.env.NODE_ENV === "production";
const REFRESH_INTERVAL = IS_PROD ? 0 : 60000 * 5; // 60000 ms === 1 min
const YOUTUBE_TYPE = "YouTube";
const YOUTUBE_THUMBNAIL_TYPE = "YouTubeThumbnail";

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    youTubeIds: Joi.array().items(Joi.string()).required(),
    refreshInterval: Joi.number().min(0).default(REFRESH_INTERVAL),
    thumbnailMode: Joi.string().valid("none", "cdn", "download").default("cdn"),
  });
};

exports.onCreateDevServer = ({ app }, pluginOptions) => {
  if (pluginOptions.thumbnailMode === "cdn") {
    polyfillImageServiceDevRoutes(app);
  }
};

exports.createSchemaCustomization = (gatsbyUtils, pluginOptions) => {
  const { actions, schema } = gatsbyUtils;

  if (pluginOptions.thumbnailMode === "cdn") {
    const YouTubeType = `
      type YouTube implements Node {
        thumbnail: YouTubeThumbnail @link(from: "youTubeId" by: "youTubeId")
      }
    `;

    const YouTubeCdnThumbnailType = addRemoteFilePolyfillInterface(
      schema.buildObjectType({
        name: `YouTubeThumbnail`,
        fields: {
          youTubeId: "String!",
        },
        interfaces: [`Node`, `RemoteFile`],
      }),
      {
        schema,
        actions,
      }
    );

    actions.createTypes([YouTubeType, YouTubeCdnThumbnailType]);
  } else if (pluginOptions.thumbnailMode === "download") {
    const YouTubeType = `
      type YouTube implements Node {
        thumbnail: File @link(from: "fields.thumbnailFileId" to: "id")
      }
    `;

    actions.createTypes([YouTubeType]);
  }
};

exports.sourceNodes = async (gatsbyUtils, pluginOptions) => {
  const { youTubeIds } = pluginOptions;
  await Promise.all(
    youTubeIds.map((id) => createYouTubeNode(gatsbyUtils, pluginOptions, id))
  );
};

exports.onCreateNode = async (gatsbyUtils, pluginOptions) => {
  const { node } = gatsbyUtils;

  if (node.internal.type === YOUTUBE_TYPE) {
    if (pluginOptions.thumbnailMode === "cdn") {
      createYouTubeThumbnailNode(gatsbyUtils);
    } else if (pluginOptions.thumbnailMode === "download") {
      await createYouTubeThumbnailFileNode(gatsbyUtils);
    }
  }
};

const createYouTubeNode = async (gatsbyUtils, pluginOptions, youTubeId) => {
  const {
    actions: { createNode, touchNode },
    createNodeId,
    createContentDigest,
    reporter,
    getNode,
  } = gatsbyUtils;
  const { refreshInterval = REFRESH_INTERVAL } = pluginOptions;

  const youTubeNodeId = createNodeId(`${YOUTUBE_TYPE} >>> ${youTubeId}`);
  const existingNode = getNode(youTubeNodeId);
  const existingNodeAge = Date.now() - existingNode?.timestamp;

  if (existingNode && existingNodeAge <= refreshInterval) {
    // Node already exists, make sure it stays around
    touchNode(existingNode);
    reporter.info(`Touch YouTube Node for ${youTubeId}`);
  } else {
    // Fetch oEmbed data and create node
    const embedData = await fetchEmbed(youTubeId);

    createNode({
      id: youTubeNodeId,
      youTubeId: youTubeId,
      oEmbed: embedData,
      timestamp: Date.now(),
      internal: {
        type: YOUTUBE_TYPE,
        contentDigest: createContentDigest(embedData),
      },
    });

    reporter.info(`Create YouTube Node for ${youTubeId}`);
  }
};

const fetchEmbed = async (id) => {
  const youTubeUrl = `https://youtu.be/${id}`;
  const { data } = await axios.get("https://www.youtube.com/oembed", {
    params: {
      url: youTubeUrl,
    },
  });
  return { ...data, url: youTubeUrl };
};

const createYouTubeThumbnailNode = (gatsbyUtils) => {
  const { node, actions, reporter, createNodeId } = gatsbyUtils;
  const { createNode } = actions;

  const youTubeThumbnailNodeId = createNodeId(
    `${YOUTUBE_THUMBNAIL_TYPE} >>> ${node.youTubeId}`
  );

  createNode({
    id: youTubeThumbnailNodeId,
    parent: node.id,
    youTubeId: node.youTubeId,
    url: node.oEmbed.thumbnail_url,
    mimeType: "image/jpeg",
    filename: node.youTubeId + ".jpg",
    height: node.oEmbed.thumbnail_height,
    width: node.oEmbed.thumbnail_width,
    internal: {
      type: YOUTUBE_THUMBNAIL_TYPE,
      contentDigest: node.internal.contentDigest,
    },
  });

  reporter.info(`Create YouTubeThumbnail Node for ${node.youTubeId}`);
};

const createYouTubeThumbnailFileNode = async (gatsbyUtils) => {
  const { node, reporter, createNodeId, getCache } = gatsbyUtils;
  const { createNode, createNodeField } = gatsbyUtils.actions;

  const imageFile = await createRemoteFileNode({
    // The url of the remote file
    url: node.oEmbed.thumbnail_url,
    parentNodeId: node.id,
    getCache,
    createNode,
    createNodeId,
  });

  createNodeField({
    node,
    name: `thumbnailFileId`,
    value: imageFile.id,
  });

  reporter.info(`Created YouTube File Node for ${node.youTubeId} thumbnail`);
};
