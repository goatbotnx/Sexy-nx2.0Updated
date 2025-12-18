module.exports = function blockMention(event) {
  const BLOCK_UID = "61583129938292";
  return event.mentions && event.mentions[BLOCK_UID];
};
