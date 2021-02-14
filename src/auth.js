const fs = require('fs');

let tokens = JSON.parse(fs.readFileSync(`${__dirname}/../keys/tokens.json`, 'utf8'));

fs.watch(`${__dirname}/../keys/tokens.json`, (event, filename) => {
  if (filename) {
    tokens = JSON.parse(fs.readFileSync(`${__dirname}/../keys/tokens.json`, 'utf8'));
  }
});

module.exports = {
  authToken(key) {
    for (let i = 0; i < tokens.length; i += 1) {
      if (tokens[i] === key) {
        return true;
      }
    }
    return false;
  },
};
