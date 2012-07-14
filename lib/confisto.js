var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , parsers = require('./parsers')

/**
 * Reads file `filePath`, and files inside `dirPath`
 * and merges defaults with all the files read
 * calls `cb(err, config)` when error occured or finished
 *
 * All paths are relative to CWD
 *
 * @param  {Object}   params   Parameters for configuration loading
 *                              * file     -- configuration file to load
 *                              * dir      -- configuration directory to load
 *                              * defaults -- object with default values
 *                              * parser   -- parser to use
 * @param  {Function} cb       Function to call when error occured or finished
 */
function confisto(params, cb) {
  var filePath  = params.file
    , dirPath   = params.dir
    , defaults  = params.defaults || {}
    , parserStr = params.parser || 'json'

  if (typeof cb !== 'function') {
    throw new Error('Callback missing or not a function')
  }
  if (!filePath) {
    return cb(new Error('file parameter missing or empty'))
  }
  var parser = parsers[parserStr]
  if (!parser) {
    return cb(new Error('dont know parser "' + parserStr + '"'))
  }


  // Paths that we are going to stat
  var paths = [path.resolve(filePath)]
  if (typeof dirPath !== 'undefined') {
    paths.push(path.resolve(dirPath))
  }

  // Let the water flow
  async.waterfall([
    // `stat` each `path`
    function statPaths(asyncCb) {
      async.map(paths, fs.stat, function statPathsCb(err, statResults) {
        if (err) {
          // Get the path that failed and add it to err
          var problemIndex = statResults.indexOf(undefined)
          if (problemIndex !== -1) {
            err.path = paths[problemIndex]
          }
          else {
            throw new Error('this should not happen')
          }
        }
        else if (statResults[0].isDirectory()) {
          // first path should be main config file, not a directory
          err = new Error('main config file [' + paths[0] + '] is a directory')
        }
        else {
          // to each `stat` result, add the appropriate path
          statResults.forEach(function (stat, i) {
            stat.path = paths[i]
          })
        }
        asyncCb(err, statResults)
      })
    },
    // get the files inside each directory
    function readDirs(stats, asyncCb) {
      /**
       * Array of files that we will read later
       * @type {Array}
       */
      var filePaths = []
      // Push all files to the array
      stats.forEach(function (stat) {
        if (!stat.isDirectory()) {
          filePaths.push(stat.path)
        }
      })

      // Array of directories
      var dirs = stats.filter(function (stat) {
        return stat.isDirectory()
      })

      // For each dir, get contents, and stat each file to filter directories
      async.forEach(dirs, function (dir, forEachCb) {
        fs.readdir(dir.path, function (err, files) {
          if (err) {
            return forEachCb(err)
          }
          // Prepend dir path to each file (so its an absolute path)
          files = files.map(function (file) {
            return dir.path + '/' + file
          })
          // Stat all files inside the directory
          async.map(files, fs.stat, function (err, statFiles) {
            if (err) {
              return forEachCb(err)
            }
            // Push non-directories to filePaths
            statFiles.forEach(function (stat, i) {
              if (!stat.isDirectory()) {
                filePaths.push(files[i])
              }
            })
            forEachCb()
          })
        })
      }, function (err) {
        asyncCb(err, filePaths)
      })
    },
    // Parse every file
    function parseFiles(configPaths, asyncCb) {
      async.map(configPaths, function (path, mapCb) {
        fs.readFile(path, function (err, data) {
          if (err) {
            return mapCb(err)
          }
          // Call the parser on the file contents
          parser(data, function (err, parsedData) {
            if (err) {
              return mapCb(err)
            }
            mapCb(null, parsedData)
          })
        })
      }, asyncCb)
    },
    function mergeConfig(configs, asyncCb) {
      var mergeArgs = [{}].concat(configs)
      var finalConfig = confisto.merge.apply(null, mergeArgs)
      asyncCb(null, finalConfig)
    }
  ], cb)
}

function merge() {
  var target = arguments[0] || {}
    , length = arguments.length

  if (length <= 1) {
    return target
  }

  for (var i = 1; i < length; i++) {
    var object = arguments[i]

    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        var value = object[key]
          , valueType = typeof value
        
        if (Array.isArray(value)) {
          var len = value.length
          if (typeof target[key] === 'undefined') {
            target[key] = []
          }
          if (Array.isArray(target[key])) {
            for (var j = 0; j < len; j++) {
              target[key].push(merge(value[j]))
            }
          }
          else {
            throw new Error('type mismatch [' + key + ']')
          }
        }
        else if (valueType === 'object') {
          target[key] = merge(target[key], value)
        }
        else {
          target[key] = object[key]
        }
      }
    }
  }

  return target
}

confisto.merge = merge
module.exports = confisto