// https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/

const axios = require("axios");
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

const SPLIT_ASCII = ">>>";
const IS_PROD = process.env.NODE_ENV === "production";
const REFRESH_INTERVAL = IS_PROD ? 0 : 60000 * 5; // 60000 ms === 1 min

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    youTubeIds: Joi.array().items(Joi.string()).required(),
    refreshInterval: Joi.number().min(0).default(REFRESH_INTERVAL),
    splitAscii: Joi.string().default(SPLIT_ASCII),
  });
};

const fetchEmbed = async (id) => {
  const ytUrl = `https://youtu.be/${id}`;
  const { data } = await axios.get("https://www.youtube.com/oembed", {
    params: {
      url: ytUrl,
    },
  });
  return { ...data, url: ytUrl };
};

const prepYouTubeNode = async (gatsbyUtils, pluginOptions, ytId) => {
  const {
    actions: { createNode, touchNode },
    createNodeId,
    createContentDigest,
    reporter,
    cache,
    getNode,
  } = gatsbyUtils;
  const { refreshInterval = REFRESH_INTERVAL, splitAscii } = pluginOptions;

  const ytCache = await cache.get(ytId);
  const [existingNodeId, timestamp] = ytCache?.split(splitAscii) || [];
  const existingNode = getNode(existingNodeId);
  const existingNodeAge = Date.now() - timestamp;

  if (existingNode && existingNodeAge <= refreshInterval) {
    // Node already exists, make sure it stays around
    touchNode(existingNode);
    reporter.info(`Touched YouTube Node for ${ytId}`);
  } else {
    // Fetch oEmbed data and create node
    const youTubeNodeId = createNodeId(`you-tube-${ytId}`);
    const embedData = await fetchEmbed(ytId);

    createNode({
      id: youTubeNodeId,
      youTubeId: ytId,
      oEmbed: embedData,
      internal: {
        type: `YouTube`,
        contentDigest: createContentDigest(embedData),
      },
    });

    await cache.set(ytId, `${youTubeNodeId}${splitAscii}${Date.now()}`);
    reporter.info(`Created YouTube Node for ${ytId}`);
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
  }
};

exports.createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type YouTube implements Node {
      thumbnail: File @link(from: "fields.thumbnailFileId")
    }
  `);
};
