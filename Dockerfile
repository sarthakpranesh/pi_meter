# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
RUN mkdir -p /pi_host/sys/devices/system/cpu/cpu0/cpufreq
RUN mkdir -p /pi_host/sys/class/thermal/thermal_zone0
RUN mkdir -p /pi_host/sys/devices/platform
RUN mkdir -p /pi_host/etc
RUN mkdir -p /pi_host/proc
RUN chmod -R 777 /pi_host 

COPY . .
RUN cd ./backend && bun install --frozen-lockfile
RUN cd ./ui && bun install --frozen-lockfile
RUN cd ./ui && bun run buildD

# run the app
USER bun
EXPOSE 8004/tcp
EXPOSE 8011/tcp

CMD ./start.sh
