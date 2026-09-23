module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@reduxjs/toolkit|react-redux|redux|redux-thunk|immer|reselect)/)',
  ],
};
