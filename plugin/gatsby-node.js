// https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/

const axios = require("axios");
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    youTubeIds: Joi.array().items(Joi.string()).required(),
  });
};

const fetchEmbed = async (id) => {
  const ytUrl = `https://youtu.be/${id}`;
  const { data } = await axios.get("https://www.youtube.com/oembed", {
    params: {
      url: ytUrl,
    },
  });
  return data;
};

const prepYouTubeNode = async (gatsbyUtils, id) => {
  const {
    actions: { createNode },
    createNodeId,
    createContentDigest,
    reporter,
  } = gatsbyUtils;

  const youTubeNodeId = createNodeId(`you-tube-${id}`);
  const embedData = await fetchEmbed(id);

  createNode({
    id: youTubeNodeId,
    youTubeId: id,
    oEmbed: embedData,
    internal: {
      type: `YouTube`,
      contentDigest: createContentDigest(embedData),
    },
  });

  reporter.info(`Created YouTube Node for ${id}`);
};

exports.sourceNodes = async (gatsbyUtils, pluginOptions) => {
  const { youTubeIds } = pluginOptions;
  await Promise.all(youTubeIds.map((id) => prepYouTubeNode(gatsbyUtils, id)));
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
