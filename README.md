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
* `defaults`: Object with default values or path (string) to a file with default values. Optional.
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


### confisto.keep(ns, config)

Keep configuration object `config` under namespace `ns` so that it can be obtained from other files.

### confisto.get(ns)

Get the configuration object of namespace `ns`

## Example

```javascript
// file1.js
var confisto = require('confisto')
  , func     = require('./file2')

confisto({
  file: 'main.conf'
}, function (err, config) {
  // handle err
  confisto.keep('main', config)
  func()
})

// file2.js
var confisto = require('confisto')

module.exports = function () {
  var mainConfig = config.get('main')
  console.log(mainConfig.logFile)
}
```