FROM node:24-alpine AS builder
ENV CI=true
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@job-scraper/backend
RUN pnpm --filter=@job-scraper/backend deploy --prod --legacy /prod/backend

FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder --chown=node:node /prod/backend ./
USER node
EXPOSE 3030
CMD ["sh", "-c", "node node_modules/typeorm/cli.js migration:run -d dist/db/data-source.js && node dist/main.js"]
