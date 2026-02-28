#!/bin/bash
set -e
npm run db:push
NODE_ENV=production node dist/index.cjs
