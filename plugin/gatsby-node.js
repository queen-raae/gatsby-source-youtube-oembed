// https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/

const axios = require("axios");
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);
const {
  addRemoteFilePolyfillInterface,
} = require("gatsby-plugin-utils/polyfill-remote-file");

const SPLIT_ASCII = ">>>";
const IS_PROD = process.env.NODE_ENV === "production";
const REFRESH_INTERVAL = IS_PROD ? 0 : 60000 * 5; // 60000 ms === 1 min

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    youTubeIds: Joi.array().items(Joi.string()).required(),
    refreshInterval: Joi.number().min(0).default(REFRESH_INTERVAL),
    // Will not document splitAscii
    splitAscii: Joi.string().default(SPLIT_ASCII),
  });
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

const prepYouTubeNode = async (gatsbyUtils, pluginOptions, youTubeId) => {
  const {
    actions: { createNode, touchNode },
    createNodeId,
    createContentDigest,
    reporter,
    cache,
    getNode,
  } = gatsbyUtils;
  const { refreshInterval = REFRESH_INTERVAL, splitAscii } = pluginOptions;

  const youTubeCache = await cache.get(youTubeId);
  const [existingNodeId, timestamp] = youTubeCache?.split(splitAscii) || [];
  const existingNode = getNode(existingNodeId);
  const existingNodeAge = Date.now() - timestamp;

  if (existingNode && existingNodeAge <= refreshInterval) {
    // Node already exists, make sure it stays around
    touchNode(existingNode);
    reporter.info(`Touched YouTube Node for ${youTubeId}`);
  } else {
    // Fetch oEmbed data and create node
    const youTubeNodeId = createNodeId(`you-tube-${youTubeId}`);
    const embedData = await fetchEmbed(youTubeId);

    createNode({
      id: youTubeNodeId,
      youTubeId: youTubeId,
      oEmbed: embedData,
      internal: {
        type: `YouTube`,
        contentDigest: createContentDigest(embedData),
      },
    });

    await cache.set(youTubeId, `${youTubeNodeId}${splitAscii}${Date.now()}`);
    reporter.info(`Created YouTube Node for ${youTubeId}`);
  }
};

exports.sourceNodes = async (gatsbyUtils, pluginOptions) => {
  const { youTubeIds } = pluginOptions;
  await Promise.all(
    youTubeIds.map((id) => prepYouTubeNode(gatsbyUtils, pluginOptions, id))
  );
};

exports.onCreateNode = async (gatsbyUtils) => {
  const { node, actions, reporter, createNodeId, getCache } = gatsbyUtils;
  const { createNodeField, createNode } = actions;

  if (node.internal.type === `YouTube`) {
    const youTubeThumbnailNodeId = createNodeId(
      `you-tube-thumnail-${node.youTubeId}`
    );

    createNode({
      id: youTubeThumbnailNodeId,
      youTubeId: node.youTubeId,
      internal: {
        type: `YouTubeThumbnail`,
        contentDigest: node.internal.contentDigest,
      },
      url: node.oEmbed.thumbnail_url,
      // placeholderUrl: `${file.url}?w=%width%&h=%height%`,
      mimeType: "image/jpeg",
      filename: node.youTubeId + ".jpg",
      width: node.oEmbed.thumbnail_width,
      height: node.oEmbed.thumbnail_height,
    });

    createNodeField({
      node,
      name: `thumbnailFileId`,
      value: youTubeThumbnailNodeId,
    });

    reporter.info(`Created YouTube File Node for ${node.youTubeId} thumbnail`);
  }
};

exports.createSchemaCustomization = ({ actions, schema }) => {
  actions.createTypes([
    `
    type YouTube implements Node {
      thumbnail: YouTubeThumbnail @link(from: "fields.thumbnailFileId")
    }
  `,
    addRemoteFilePolyfillInterface(
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
    ),
  ]);
};
