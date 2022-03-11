const { CIRCLE_BRANCH: branch } = process.env;

const releaseConfig = {
  plugins: ["master", "main"].includes(branch)
    ? [
        [
          "@semantic-release/commit-analyzer",
          {
            preset: "angular",
            releaseRules: [
              {
                type: "docs",
                scope: "README",
                release: "patch",
              },
              {
                type: "refactor",
                release: "patch",
              },
              {
                type: "chore",
                release: "patch",
              },
              {
                type: "style",
                release: "patch",
              },
              {
                scope: "no-release",
                release: false,
              },
            ],
            parserOpts: {
              noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"],
            },
          },
        ],
        "@semantic-release/release-notes-generator",
        "@semantic-release/changelog",
        [
          "@semantic-release/git",
          {
            assets: [
              "dist/**/*.{js,css}",
              "CHANGELOG.md",
              "docs",
              "package.json",
              "pyproject.toml",
              "bin/*",
            ],
            message:
              "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
          },
        ],
      ]
    : [
        "@semantic-release/commit-analyzer",
        {
          preset: "angular",
          releaseRules: [
            {
              type: "docs",
              scope: "README",
              release: "patch",
            },
            {
              type: "refactor",
              release: "patch",
            },
            {
              type: "chore",
              release: "patch",
            },
            {
              type: "style",
              release: "patch",
            },
            {
              scope: "no-release",
              release: false,
            },
          ],
          parserOpts: {
            noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"],
          },
        },
      ],
  branches: [
    "main",
    {
      name: "develop",
      prerelease: "rc",
      channel: false,
    },
  ],
};

module.exports = releaseConfig;
