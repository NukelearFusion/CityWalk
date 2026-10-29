# Multi-stage build for the API.
#
# The build stage carries the toolchain and the dev dependencies; the final
# image keeps only what is needed to run, which makes it smaller and shrinks the
# surface an attacker could reach inside the container.

FROM node:22-alpine AS build

WORKDIR /app

# Manifests first: this layer is cached and only invalidated when a dependency
# actually changes, so ordinary code edits do not trigger a reinstall.
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN npm ci --workspace=@citywalk/shared --workspace=@citywalk/api --include-workspace-root

COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN npm run build --workspace=@citywalk/shared \
    && npm run build --workspace=@citywalk/api

# Drop development dependencies before they are copied into the final image.
RUN npm prune --omit=dev


FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Run as an unprivileged user. The node image ships one; a process that never
# needs to write outside its own workspace should not run as root.
USER node

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/packages/shared/dist ./packages/shared/dist
COPY --from=build --chown=node:node /app/packages/shared/package.json ./packages/shared/
COPY --from=build --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=node:node /app/apps/api/package.json ./apps/api/
COPY --from=build --chown=node:node /app/apps/api/prisma ./apps/api/prisma

EXPOSE 4000

# Reports the container unhealthy when the process is up but the database is not
# reachable — the state a plain port check would call healthy.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/api/dist/index.js"]
