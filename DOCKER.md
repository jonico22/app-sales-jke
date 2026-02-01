# Docker Commands Quick Reference

## Development

```bash
# Start development server with hot-reload
npm run docker:dev

# Rebuild and start (use when dependencies change)
npm run docker:dev:build

# Stop development containers
npm run docker:dev:down
```

Access at: `http://localhost:5173`

## Production

```bash
# Start production build
npm run docker:prod

# Rebuild and start
npm run docker:prod:build

# Stop production containers
npm run docker:prod:down
```

Access at: `http://localhost:3000`

## Utility Commands

```bash
# View container logs (follow mode)
npm run docker:logs

# Stop containers (without removing)
npm run docker:stop
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

For production, use:
```env
VITE_API_URL=https://api.yourdomain.com/api
```
