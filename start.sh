#!/bin/bash
npm run db:push
NODE_ENV=production node dist/index.cjs
