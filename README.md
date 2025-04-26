# reupload
Reupload is a high performance media uploading and optimizing server.

## Before Using
Rename `.env.example` to `.env` and set values by yourself! These environment values are required for project.

## Development
```
yarn dev
```

### Expected output
```
❯ yarn dev
yarn run v1.22.22
$ tsx --watch src/main.ts
✨ Server is listening on port 3000
```

## Building
ESBuild is used for building and bundling with esbuild-plugin-tsc.
```
yarn build
```

### Expected output
```
❯ yarn build
yarn run v1.22.22
$ tsx esbuild.ts

  dist/main.js  4.3kb

Done in 0.88s.
```

### Starting in production
After building you can start project in production by using
```
yarn start
```

#### Expected output
```
❯ yarn start
yarn run v1.22.22
$ node dist/main.js
✨ Server is listening on port 3000
```

## Linting
```
yarn lint
```

### Expected output
```
❯ yarn lint
yarn run v1.22.22
$ eslint
Done in 1.55s.
```

## Deploying
You can use Docker for deploying to production. Dockerfile of project is defined.