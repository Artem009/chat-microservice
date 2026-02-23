# Fastify Skill

## Overview
Fastify is a fast, low-overhead web framework for Node.js. Used as NestJS HTTP adapter.

## Key Patterns (from reference project)
- NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())
- @fastify/static for static file serving
- Fastify-compatible Swagger setup

## Anti-Patterns
- Don't use Express middleware directly (use Fastify equivalents)
- Don't access req.body before validation (Fastify parses differently)

---
*Placeholder skill. Run `/wogi-skills refresh` to populate with Context7 documentation.*
