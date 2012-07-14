# Confisto

Confisto is a simple configuration loader for node.

## Features

* Multiple parsers (currently only json included)
* Can read directories with extra configuration files
* Async

## API

The API is fairly simple. The module exports a single function `confisto`.

### confisto(params, cb)

#### params

* `file`: File to load that contains the main configuration.
* `dir`: Directory to read and load that contains many seperate configuration files. Optional.
* `defaults`: Object with default values for each configuration parameter. Optional.
* `parser`: Parser to use while loading files Optional. (default `'json'`)

#### cb(err, config)

Function to call when done loading configurations.

* `err`: Error in case of an error
* `configs`: Object containing the result of merging the configuration files together

## Example

```javascript
var confisto = require('confisto')

confisto({
  file: 'my.conf'
, defaults: {
    logPath: '/var/log/my/errors.log'
  , dbconn: {
      host: 'db.example.com'
    , port: 1337
    }
  , users: ['dan']  
  }
}, function (err, config) {
  if (err) {
    console.error(err)
    process.exit()
  }
  console.log(config)
})
```

my.conf

    { "logPath": "templog.log
      "dbconn": {
        "host":  "localhost"
        "user":  "root"
      }
      "users": ["joe"]
    }

will print

    { logPath: 'templog.log'
    , dbconn: {
        host: 'localhost'
      , user: 'root'  
      }
    , users: ['dan', 'joe']
    }