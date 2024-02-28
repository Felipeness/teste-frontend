FROM node:20 as builder
WORKDIR /app
RUN corepack enable
COPY package.json .
COPY yarn.lock .
RUN yarn install --immutable
COPY . .
RUN yarn gen:api
RUN yarn build

FROM node:20 as runner
WORKDIR /app
RUN corepack enable
COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .
COPY --from=builder /app/.yarn/cache .yarn/cache
COPY user-data.json .
RUN yarn workspaces focus --production
COPY --from=builder /app/dist dist

CMD ["yarn", "start"]
