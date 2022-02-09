'use strict';

module.exports = md => {
  md.block.ruler.before('paragraph', 'youtube', (state, startLine, endLine, silent) => {
    // If silent, don't replace
    if (silent) return false;

    // Get current string to consider (just current line)
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const currentLine = state.src.substring(pos, max);

    // Perform some non-regex checks for speed
    if (currentLine.length < 11) return false; // [youtube a]
    if (currentLine.slice(0, 9) !== '[youtube ') return false;
    if (currentLine[currentLine.length - 1] !== ']') return false;

    // Check for youtube match
    const match = currentLine.match(/^\[youtube (\S+?)(?: (\d+))?(?: (\d+))?\]$/);
    if (!match) return false;

    // Get the id
    const id = match[1];
    if (!id) return false;

    // Get the height
    const height = Number(match[2]) || 270;

    // Get the width
    const width = Number(match[3]) || 480;

    // Update the pos for the parser
    state.line = startLine + 1;

    // Add token to state
    const token = state.push('youtube', 'youtube', 0);
    token.block = true;
    token.markup = match[0];
    token.youtube = { id, height, width };

    // Done
    return true;
  });

  md.renderer.rules.youtube = (tokens, index) => {
    const token = tokens[index];

    // Return the HTML
    return `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(token.youtube.id)}" class="youtube" height="${token.youtube.height}" width="${token.youtube.width}" frameborder="0" allowfullscreen>
    <a href="https://www.youtube.com/watch?v=${encodeURIComponent(token.youtube.id)}" target="_blank">View YouTube video</a>
</iframe>\n`;
  };
};