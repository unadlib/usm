module.exports = {
  "presets": [
    [
      "@babel/preset-env", {
        "useBuiltIns": 'usage',
      }
    ],
    "@babel/preset-typescript"
  ],
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose" : true }]
  ]
};
