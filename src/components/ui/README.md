# UI Components Organization

This directory contains all the UI components organized by their purpose and complexity level.

## Structure

```
src/components/ui/
├── primitives/          # Base shadcn/ui components (no business logic)
├── presets/            # Business-specific composed components
├── index.ts            # Barrel exports for clean imports
└── README.md           # This documentation
```

## Primitives (`/primitives`)

Base UI components from shadcn/ui with minimal business logic. These are the building blocks for more complex components.

- `badge.tsx` - Base badge primitive with variants
- `button.tsx` - Base button primitive
- `card.tsx` - Card, CardHeader, CardTitle, CardContent, CardFooter primitives
- `input.tsx` - Base input primitive
- `tabs.tsx` - Tabs, TabsList, TabsTrigger, TabsContent primitives
- `textarea.tsx` - Base textarea primitive

## Presets (`/presets`)

Composed components that combine primitives with business logic for specific use cases.

- `badge-presets.tsx` - PartOfSpeechBadge, FormalityBadge, DifficultyBadge, etc.
- `card-presets.tsx` - FormCard, SectionCard, StatusCard, ResultCard, ErrorCard

## Usage

### Recommended: Use barrel exports

```tsx
import { Button, FormCard, PartOfSpeechBadge } from '@/components/ui'
```

### Alternative: Direct imports

```tsx
import { Button } from '@/components/ui/primitives/button'
import { FormCard } from '@/components/ui/presets/card-presets'
```

## Guidelines

### When to use Primitives
- Building new custom components
- Need maximum flexibility and control
- Creating one-off layouts

### When to use Presets
- Standard business use cases (forms, sections, etc.)
- Want consistency across the app
- Need built-in business logic (error handling, button states, etc.)

### Adding New Components

**Primitives**: Add to `/primitives` if it's a base UI component with no business logic.

**Presets**: Add to `/presets` if it combines multiple primitives or includes business-specific logic.

Remember to:
1. Export new components in `index.ts`
2. Follow existing naming conventions
3. Include proper TypeScript types
4. Add documentation for complex components

## Examples

### FormCard (Preset)
```tsx
<FormCard
  title="Enter Your Data"
  primaryButton={{
    label: 'Submit',
    isLoading: loading,
    isDisabled: !isValid
  }}
  error={error}
>
  <Input value={value} onChange={setValue} />
</FormCard>
```

### Custom Card (Primitives)
```tsx
<Card>
  <CardHeader>
    <CardTitle>Custom Layout</CardTitle>
  </CardHeader>
  <CardContent>
    <!-- Custom content -->
  </CardContent>
</Card>
```