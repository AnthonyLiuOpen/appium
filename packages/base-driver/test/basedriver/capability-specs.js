import { default as BaseDriver, errors } from '../../lib';
import logger from '../../lib/basedriver/logger';
import { createSandbox } from 'sinon';


describe('Desired Capabilities', function () {
  let d;
  let sandbox;

  beforeEach(function () {
    d = new BaseDriver();
    sandbox = createSandbox();
    sandbox.spy(d.log, 'warn');
    sandbox.spy(logger, 'warn');
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should require platformName and deviceName', async function () {
    try {
      await d.createSession({
        firstMatch: [{}]
      });
    } catch (e) {
      e.should.be.instanceof(errors.SessionNotCreatedError);
      e.message.should.contain('platformName');
      return;
    }

    /* istanbul ignore next */
    should.fail('error should have been thrown');
  });


  it('should require platformName', async function () {
    try {
      await d.createSession({
        alwaysMatch: {
          'appium:deviceName': 'Delorean'
        }
      });
    } catch (e) {
      e.should.be.instanceof(errors.SessionNotCreatedError);
      e.message.should.contain('platformName');
      return;
    }

    /* istanbul ignore next */
    should.fail('error should have been thrown');
  });

  it('should not care about cap order', async function () {

    await d.createSession(null, null, {
      alwaysMatch: {
        'appium:deviceName': 'Delorean',
        platformName: 'iOS'
      }
    });

  });

  it('should check required caps which are added to driver', async function () {
    d.desiredCapConstraints = {
      necessary: {
        presence: true
      },
      proper: {
        presence: true,
        isString: true,
        inclusion: ['Delorean', 'Reventon']
      }
    };

    try {
      await d.createSession(null, null, {
        alwaysMatch: {
          'platformName': 'iOS',
          'appium:deviceName': 'Delorean'
        }
      });
    } catch (e) {
      e.should.be.instanceof(errors.SessionNotCreatedError);
      e.message.should.contain('necessary');
      e.message.should.contain('proper');
      return;
    }

    /* istanbul ignore next */
    should.fail('error should have been thrown');
  });

  it('should check added required caps in addition to base', async function () {
    d.desiredCapConstraints = {
      necessary: {
        presence: true
      },
      proper: {
        presence: true,
        isString: true,
        inclusion: ['Delorean', 'Reventon']
      }
    };

    try {
      await d.createSession(null, null, {
        alwaysMatch: {
          'appium:necessary': 'yup'
        }
      });
    } catch (e) {
      e.should.be.instanceof(errors.SessionNotCreatedError);
      e.message.should.contain('platformName');
      return;
    }

    /* istanbul ignore next */
    should.fail('error should have been thrown');
  });

  it('should accept extra capabilities', async function () {
    await d.createSession(null, null, {
      alwaysMatch: {
        'platformName': 'iOS',
        'appium:deviceName': 'Delorean',
        'appium:extra': 'cheese',
        'appium:hold the': 'sauce'
      }
    });
  });

  it('should log the use of extra caps', async function () {
    this.timeout(500);

    await d.createSession(null, null, {
      alwaysMatch: {
        'platformName': 'iOS',
        'appium:deviceName': 'Delorean',
        'appium:extra': 'cheese',
        'appium:hold the': 'sauce'
      }
    });

    d.log.warn.callCount.should.be.above(0);
  });

  it('should be sensitive to the case of caps', async function () {
    try {
      await d.createSession(null, null, {
        alwaysMatch: {
          'platformname': 'iOS',
          'appium:deviceName': 'Delorean'
        }
      });
    } catch (e) {
      e.should.be.instanceof(errors.SessionNotCreatedError);
      e.message.should.contain('platformName');
      return;
    }

    /* istanbul ignore next */
    should.fail('error should have been thrown');
  });

  describe('boolean capabilities', function () {
    it('should allow a string "false"', async function () {
      await d.createSession(null, null, {
        alwaysMatch: {
          'platformName': 'iOS',
          'appium:deviceName': 'Delorean',
          'appium:noReset': 'false'
        }
      });
      d.log.warn.callCount.should.be.above(0);

      let sessions = await d.getSessions();
      sessions[0].capabilities.noReset.should.eql(false);
    });

    it('should allow a string "true"', async function () {
      await d.createSession(null, null, {
        alwaysMatch: {
          'platformName': 'iOS',
          'appium:deviceName': 'Delorean',
          'appium:noReset': 'true'
        }
      });
      d.log.warn.callCount.should.be.above(0);

      let sessions = await d.getSessions();
      sessions[0].capabilities.noReset.should.eql(true);
    });

    it('should allow a string "true" in string capabilities', async function () {
      await d.createSession(null, null, {
        alwaysMatch: {
          'platformName': 'iOS',
          'appium:deviceName': 'Delorean',
          'appium:language': 'true'
        }
      });
      d.log.warn.callCount.should.equal(0);

      let sessions = await d.getSessions();
      sessions[0].capabilities.language.should.eql('true');
    });
  });

  describe('number capabilities', function () {
    it('should allow a string "1"', async function () {
      await d.createSession(null, null, {
        alwaysMatch: {
          'platformName': 'iOS',
          'appium:deviceName': 'Delorean',
          'appium:newCommandTimeout': '1'
        }
      });
      d.log.warn.callCount.should.be.above(0);

      let sessions = await d.getSessions();
      sessions[0].capabilities.newCommandTimeout.should.eql(1);
    });

    it('should allow a string "1.1"', async function () {
      await d.createSession(null, null, {
        alwaysMatch: {
          'platformName': 'iOS',
          'appium:deviceName': 'Delorean',
          'appium:newCommandTimeout': '1.1'
        }
      });
      d.log.warn.callCount.should.be.above(0);

      let sessions = await d.getSessions();
      sessions[0].capabilities.newCommandTimeout.should.eql(1.1);
    });

    it('should allow a string "1" in string capabilities', async function () {
      await d.createSession(null, null, {
        alwaysMatch: {
          'platformName': 'iOS',
          'appium:deviceName': 'Delorean',
          'appium:language': '1'
        }
      });
      d.log.warn.callCount.should.equal(0);

      let sessions = await d.getSessions();
      sessions[0].capabilities.language.should.eql('1');
    });
  });

  it ('should error if objects in caps', async function () {
    try {
      await d.createSession(null, null, {
        alwaysMatch: {
          'platformName': {a: 'iOS'},
          'appium:deviceName': 'Delorean'
        }
      });
    } catch (e) {
      e.should.be.instanceof(errors.SessionNotCreatedError);
      e.message.should.contain('platformName');
      return;
    }

    /* istanbul ignore next */
    should.fail('error should have been thrown');
  });

  it('should check for deprecated caps', async function () {
    this.timeout(500);

    d.desiredCapConstraints = {
      'lynx-version': {
        deprecated: true
      }
    };

    await d.createSession(null, null, {
      alwaysMatch: {
        'platformName': 'iOS',
        'appium:deviceName': 'Delorean',
        'appium:lynx-version': 5
      }
    });

    logger.warn.callCount.should.be.above(0);
  });

  it('should not warn if deprecated=false', async function () {
    this.timeout(500);

    d.desiredCapConstraints = {
      'lynx-version': {
        deprecated: false
      }
    };

    await d.createSession(null, null, {
      alwaysMatch: {
        'platformName': 'iOS',
        'appium:deviceName': 'Delorean',
        'appium:lynx-version': 5
      }
    });

    d.log.warn.callCount.should.equal(0);
  });

  it('should not validate against null/undefined caps', async function () {
    d.desiredCapConstraints = {
      'foo': {
        isString: true
      }
    };

    await d.createSession(null, null, {
      alwaysMatch: {
        platformName: 'iOS',
        'appium:deviceName': 'Dumb',
        'appium:foo': null
      }
    });
    await d.deleteSession();

    await d.createSession(null, null, {
      alwaysMatch: {
        platformName: 'iOS',
        'appium:deviceName': 'Dumb',
        'appium:foo': 1
      }
    }).should.eventually.be.rejectedWith(/'foo' must be of type string/);

    await d.createSession(null, null, {
      alwaysMatch: {
        platformName: 'iOS',
        'appium:deviceName': 'Dumb',
        'appium:foo': undefined
      }
    });
    await d.deleteSession();

    await d.createSession(null, null, {
      alwaysMatch: {
        platformName: 'iOS',
        'appium:deviceName': 'Dumb',
        'appium:foo': ''
      }
    });
    await d.deleteSession();
  });

  it('should still validate null/undefined/empty caps whose presence is required', async function () {
    d.desiredCapConstraints = {
      foo: {
        presence: true
      },
    };

    await d.createSession(null, null, {
      alwaysMatch: {
        platformName: 'iOS',
        'appium:deviceName': 'Dumb',
        'appium:foo': null
      }
    }).should.eventually.be.rejectedWith(/blank/);

    await d.createSession(null, {
      alwaysMatch: {
        platformName: 'iOS',
        'appium:deviceName': 'Dumb',
        'appium:foo': ''
      }
    }).should.eventually.be.rejectedWith(/blank/);

    await d.createSession({
      firstMatch: [{
        platformName: 'iOS',
        'appium:deviceName': 'Dumb',
        'appium:foo': {}
      }]
    }).should.eventually.be.rejectedWith(/blank/);

    await d.createSession({
      alwaysMatch: {
        platformName: 'iOS',
        'appium:deviceName': 'Dumb',
        'appium:foo': []
      }
    }).should.eventually.be.rejectedWith(/blank/);

    await d.createSession({
      alwaysMatch: {
        platformName: 'iOS',
        'appium:deviceName': 'Dumb',
        'appium:foo': '  '
      }
    }).should.eventually.be.rejectedWith(/blank/);
  });

  describe('w3c', function () {
    it('should accept w3c capabilities', async function () {
      const [sessionId, caps] = await d.createSession(null, null, {
        alwaysMatch: {
          platformName: 'iOS',
          'appium:deviceName': 'Delorean'
        }, firstMatch: [{}],
      });
      sessionId.should.exist;
      caps.should.eql({
        platformName: 'iOS',
        deviceName: 'Delorean',
      });
      await d.deleteSession();
    });

    it('should raise an error if w3c capabilities is not a plain JSON object', async function () {
      for (const val of [true, 'string', [], 100]) {
        try {
          await d.createSession(null, null, val);
        } catch (e) {
          e.should.be.instanceof(errors.SessionNotCreatedError);
          continue;
        }
        /* istanbul ignore next */
        should.fail('error should have been thrown');
      }
    });
  });
});
