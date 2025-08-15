# shadcn/ui to React Aria Components Migration Plan

## Overview
Migration from shadcn/ui components to React Aria Components for better accessibility, smaller bundle size, and future-proof architecture.

## Current shadcn/ui Components Analysis
- **Button** (15+ usages) - Most critical component
- **Input** (10+ usages) - Forms & validation  
- **Card** family (8+ usages) - Layout & content
- **Label** (6+ usages) - Form accessibility
- **Dialog** family - Modal interactions
- **Table** family - Data display
- **Tabs** family - Navigation
- **Avatar** family - Profile images
- **Select** family - Dropdowns
- **Switch** - Settings toggles
- **Textarea** - Multi-line input

## Migration Todo List

### Phase 1: Setup & Configuration
- [ ] 1. Research and install React Aria Components dependencies (react-aria-components, tailwindcss-react-aria-components plugin, tailwindcss-animate)
- [ ] 2. Update Tailwind CSS configuration to include React Aria plugin

### Phase 2: Component Creation
- [ ] 3. Create React Aria Button component to replace shadcn Button (used in 15+ files)
- [ ] 4. Create React Aria Input component to replace shadcn Input (used in 10+ files)
- [ ] 5. Create React Aria Card components to replace shadcn Card family (used in 8+ files)
- [ ] 6. Create React Aria Label component to replace shadcn Label (used in 6+ files)
- [ ] 7. Create React Aria Dialog/Modal components to replace shadcn Dialog family
- [ ] 8. Create React Aria Table components to replace shadcn Table family
- [ ] 9. Create React Aria Tabs components to replace shadcn Tabs family
- [ ] 10. Create React Aria Avatar component to replace shadcn Avatar family
- [ ] 11. Create React Aria Select/ComboBox components to replace shadcn Select family
- [ ] 12. Create React Aria Switch component to replace shadcn Switch
- [ ] 13. Create React Aria Textarea component to replace shadcn Textarea

### Phase 3: Component Migration
- [ ] 14. Migrate login-form.tsx to use React Aria components
- [ ] 15. Migrate profile components (ActivityHistory, AvatarUpload, ProfileInfoForm, SecurityForm, SettingsForm) to React Aria
- [ ] 16. Migrate data table components (FilamentsTable, ModelsTable) to React Aria
- [ ] 17. Migrate dialog components (AddFilamentDialog, AddModelDialog) to React Aria
- [ ] 18. Migrate editable form field components to React Aria
- [ ] 19. Migrate route components (/profile, /models, /filaments pages) to React Aria

### Phase 4: Cleanup
- [ ] 20. Update package.json to remove shadcn/ui dependencies (@radix-ui packages, class-variance-authority)
- [ ] 21. Remove shadcn/ui component files from src/components/ui/ directory
- [ ] 22. Update components.json or remove if no longer needed
- [ ] 23. Update import statements throughout codebase from @/components/ui/* to new React Aria components
- [ ] 24. Update cn() utility function usage to work with React Aria's className function pattern

### Phase 5: Testing & Validation
- [ ] 25. Test all migrated components for accessibility and functionality
- [ ] 26. Update test files to work with React Aria components
- [ ] 27. Run linting and type checking to ensure no broken imports or types
- [ ] 28. Update documentation and component examples if needed

## Key Files to Update

### Component Files
- `src/components/login-form.tsx`
- `src/components/profile/` (5 files)
- `src/components/FilamentsTable.tsx`
- `src/components/ModelsTable.tsx`
- `src/components/AddFilamentDialog.tsx`
- `src/components/AddModelDialog.tsx`
- `src/components/EditableEntityFormField.tsx`
- `src/components/EditableColorFormField.tsx`
- `src/components/EditableFormField.tsx`

### Route Files
- `src/routes/_auth/profile.tsx`
- `src/routes/_auth/models.tsx`
- `src/routes/_auth/filaments.tsx`
- `src/routes/_auth/filament.$filamentId.tsx`

### Configuration Files
- `package.json` - Dependencies
- `tailwind.config.ts` - Plugin configuration
- `components.json` - shadcn config (remove)

## Benefits of Migration
- **Better Accessibility**: Built-in ARIA support
- **Smaller Bundle**: Remove Radix UI dependencies
- **Consistent Patterns**: Unified component behavior
- **Better Tailwind Integration**: Native plugin support
- **Future-Proof**: Adobe-maintained library