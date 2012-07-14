var should = require('should')
  , confisto = require('../')
  , merge = confisto.merge


describe('confisto', function () {
  it('should throw without callback', function () {
    confisto.should.throw()
  })

  it('should callback error if file param is missng', function (done) {
    confisto({}, function (err) {
      err.should.be.instanceof(Error)
      done()
    })
  })

  it('should accept only string as path', function () {
    confisto({}, function (err) {
      err.should.be.instanceof(Error)
    })
  })

  it('should work with included test', function (done) {
    confisto(
    { file: __dirname + '/files/main.conf'
    , dir: __dirname + '/files/conf.d/'
    }
    , function (err, config) {
        should.ifError(err)
        should.deepEqual(config,
          { host: '192.168.1.5'
          , port: 8080
          , clients: ['1', '2', '3', '4', '5']
          , architecture:
              { arch: 'arm'
              , instr: 'risc'
              }
          })
        done()
      }
    )
  })

})