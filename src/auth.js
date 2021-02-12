const fs = require('fs')
module.exports = {
    authToken: function(key) {
        data = fs.readFileSync( __dirname + "/../" + "tokens.json", 'utf8')
        authenticated = false;
        tokens = JSON.parse(data);
        for (i = 0; i < tokens.length; i++) {
           if (tokens[i]==key) {
              return true;
           }
        }
        return false;
    },
    authCert: function(req) {
        console.log(req.client)
        return req.client.authorized
    }
  };