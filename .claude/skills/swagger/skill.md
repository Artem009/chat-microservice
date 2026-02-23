# Swagger / @nestjs/swagger Skill

## Overview
@nestjs/swagger provides Swagger/OpenAPI documentation for NestJS applications.

## Key Patterns (from reference project)
- DocumentBuilder for API metadata
- SwaggerModule.setup('api-docs', app, document)
- @ApiTags('<resource>') on every controller
- @ApiSecurity('authorization') for auth header
- @ApiProperty for DTO field documentation
- Custom @LocalApiProperty for environment-conditional fields
- persistAuthorization: true for Swagger UI

## Anti-Patterns
- Don't forget @ApiProperty on DTO fields (they won't show in Swagger)
- Don't skip @ApiTags (endpoints will be ungrouped)

---
*Placeholder skill. Run `/wogi-skills refresh` to populate with Context7 documentation.*
