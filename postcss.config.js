module.exports = {
  plugins: [
    // https://flaviocopes.com/tailwind-setup/
    // In development, avoid too much processing
    process.env.NODE_ENV === 'production'
      ? require('postcss-preset-env')
      : require('autoprefixer'),
    // process.env.NODE_ENV === 'production' ? require('cssnano') : null,
  ],
};
