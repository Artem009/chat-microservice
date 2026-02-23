# class-validator Skill

## Overview
class-validator provides decorator-based validation for TypeScript classes.

## Key Patterns (from reference project)
- @IsNotEmpty() + @IsString() for required string fields
- @IsOptional() + @IsString() for optional fields
- Definite assignment (!) for required, optional (?) for optional
- Global ValidationPipe with whitelist + forbidNonWhitelisted + transform
- Paired with @ApiProperty for Swagger documentation

## Anti-Patterns
- Don't skip validation decorators on DTO properties
- Don't use plain interfaces instead of classes for DTOs (validators need classes)

---
*Placeholder skill. Run `/wogi-skills refresh` to populate with Context7 documentation.*
