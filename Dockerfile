FROM node:12.18.3 as build
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:12.18.3 as production
RUN groupadd -r app && useradd -r -g app app
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV SERVER_PORT=8080
WORKDIR /usr/app

COPY ./package*.json ./
RUN npm ci --production
# COPY ./docs ./docs
COPY ./config ./config
COPY --from=build /usr/src/app/dist .

# RUN chown -R app . && \
#     mkdir -p /home/app/.config /home/app/.npm && \
#     chown -R app:app /home/app/.config /home/app/.npm
# USER app:app

CMD ["node", "index.js"]
