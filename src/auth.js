const fs = require('fs')
module.exports = {
    authToken: function(key) {
        data = fs.readFileSync( __dirname + "/../" + "keys/tokens.json", 'utf8')
        authenticated = false;
        tokens = JSON.parse(data);
        for (i = 0; i < tokens.length; i++) {
           if (tokens[i]==key) {
              return true;
           }
        }
        return false;
    }
  };