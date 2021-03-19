// NODE_ENV=test - Needed by "@snowpack/web-test-runner-plugin"
process.env.NODE_ENV = 'test';

module.exports = {
  // https://github.com/snowpackjs/snowpack/discussions/1803#discussioncomment-304832
  coverageConfig: {
    exclude: ['**/*/_snowpack/**/*'],
  },
  plugins: [require('@snowpack/web-test-runner-plugin')()],
};
