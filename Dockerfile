# ------------------ Base Stage ------------------
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat


# ------------------ Dependencies Stage ------------------
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then \
      yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
      npm ci; \
  elif [ -f pnpm-lock.yaml ]; then \
      corepack enable && pnpm i --frozen-lockfile; \
  else \
      echo "Lockfile not found." && exit 1; \
  fi


# ------------------ Builder Stage ------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f yarn.lock ]; then \
      yarn build; \
  elif [ -f package-lock.json ]; then \
      npm run build; \
  elif [ -f pnpm-lock.yaml ]; then \
      pnpm run build; \
  else \
      echo "Lockfile not found." && exit 1; \
  fi


# ------------------ Runner Stage ------------------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create user for security
RUN addgroup -g 1001 -S nodejs \
  && adduser -u 1001 -S nextjs -G nodejs

# Copy static files
COPY --from=builder /app/public ./public

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
