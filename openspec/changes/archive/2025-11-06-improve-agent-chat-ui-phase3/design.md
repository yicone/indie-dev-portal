# Design Document - Agent Chat UI Phase 3

## Context

This phase implements the complete UI/UX design for the AI Chat Panel based on the latest prototype (`prototype/DevDesk - AI First Draft/components/ChatPanel.tsx`). The design provides detailed specifications for visual styling, component hierarchy, and interaction patterns that significantly improve usability and consistency.

## Goals

- **Pixel-perfect implementation**: Match the design prototype exactly in terms of spacing, colors, typography, and component styling
- **Enhanced session management**: Provide intuitive session creation, renaming, archiving with clear visual hierarchy
- **Improved visual consistency**: Apply consistent design system across all components
- **Better user experience**: Smooth animations, clear feedback, and intuitive interactions
- **Productivity features**: Export functionality and keyboard shortcuts for power users

## Non-Goals

- Voice input implementation (UI placeholder only)
- Batch operations (export multiple sessions)
- Custom keyboard shortcut configuration
- Mobile-specific optimizations (desktop-first approach)

## Design Decisions

### 1. Fixed Panel Width (420px)

**Decision**: Use a fixed width of 420px for the chat panel instead of responsive sizing.

**Rationale**:

- Provides consistent layout across different screen sizes
- Optimal width for reading chat messages without excessive line length
- Matches common sidebar patterns in developer tools
- Simplifies component layout calculations

**Trade-offs**:

- Less flexible on smaller screens (may need future mobile optimization)
- Cannot utilize extra space on ultra-wide monitors

### 2. Session Dropdown Organization

**Decision**: Separate active and archived sessions in the dropdown with clear visual distinction.

**Rationale**:

- Reduces clutter by hiding archived sessions in a separate section
- Maintains access to historical sessions without overwhelming the UI
- Clear visual hierarchy with opacity reduction for archived items
- Follows common email/task management patterns

**Implementation**:

- Active sessions shown first with full opacity
- Separator before archived section
- "Archived" label in muted text
- Archived items at 60% opacity
- Green dot indicator for currently active session

### 3. Inline Title Editing

**Decision**: Allow inline editing of session titles with click-to-edit pattern.

**Rationale**:

- Reduces friction compared to modal dialogs
- Provides immediate visual feedback
- Familiar pattern from file explorers and note-taking apps
- Keeps user in context without navigation

**Implementation**:

- Display mode shows session name and repository
- Edit2 icon appears on hover
- Click activates edit mode with focused input
- Enter/Check saves, Escape/X cancels
- Auto-select text for easy replacement

### 4. Compact Agent/Model Selectors

**Decision**: Place agent and model selectors above the input field in a compact horizontal layout.

**Rationale**:

- Keeps selectors visible and accessible without taking vertical space
- Allows quick switching between agents/models mid-conversation
- Matches patterns from AI chat applications (ChatGPT, Claude)
- Provides context about current configuration

**Implementation**:

- Horizontal layout with small gaps (gap-1)
- Compact buttons (h-7 w-7) for Plus and Mic
- Ghost variant for minimal visual weight
- Hover states for discoverability

### 5. Modal Dialog for New Sessions

**Decision**: Use a modal dialog for creating new sessions instead of inline form.

**Rationale**:

- Focuses user attention on the creation task
- Provides clear entry/exit points
- Allows for form validation before submission
- Prevents accidental session creation

**Implementation**:

- Overlay dims background
- Close button in top-right
- Auto-focus on session name input
- Repository selector with pre-selection support
- Disabled create button until form is valid

### 6. Spring Animation for Panel

**Decision**: Use spring animation (Framer Motion) for panel slide-in effect.

**Rationale**:

- Provides smooth, natural-feeling motion
- Better than linear transitions for UI elements
- Matches modern design trends
- Improves perceived performance

**Configuration**:

```typescript
transition={{ type: "spring", damping: 30, stiffness: 300 }}
```

### 7. Color System (Catppuccin-inspired)

**Decision**: Use a dark theme with specific color tokens (crust, surface0, surface1, mauve, etc.).

**Rationale**:

- Reduces eye strain for extended coding sessions
- Matches developer tool aesthetics
- Provides clear visual hierarchy through color
- Consistent with existing design system

**Key Colors**:

- Background: `crust` (darkest)
- Surfaces: `surface0`, `surface1` (layered depth)
- Primary accent: `mauve` (user messages, buttons, focus)
- Text: `text` (primary), `muted-foreground` (secondary)
- Success indicator: `green` (active session dot)

## Component Architecture

### ChatPanel (Main Container)

- Fixed width: 420px
- Full height: 100vh
- Slide-in animation from right
- Three main sections: Header, Messages, Input

### Session Management

- **SessionDropdown**: Compact button + dropdown menu
- **SessionItem**: Name, repo, timestamp, active indicator
- **NewSessionDialog**: Modal for session creation

### Message Display

- **MessageBubble**: User (mauve) vs Assistant (surface0)
- **EmptyState**: Centered with icon and description
- **ScrollArea**: Auto-scroll to bottom on new messages

### Input Area

- **AgentSelector**: Compact dropdown for agent selection
- **ModelSelector**: Compact dropdown for model selection
- **MessageInput**: Surface0 background with embedded send button
- **ActionButtons**: Plus (attachments), Mic (voice)

## Migration Plan

### Phase 1: Visual Updates (Day 1)

1. Update ChatPanel dimensions and animations
2. Apply new color scheme and spacing
3. Refine message bubble styling
4. Update header and input area

### Phase 2: Session Management (Day 2)

1. Implement enhanced session dropdown
2. Add inline title editing
3. Create NewSessionDialog component
4. Implement archive/unarchive functionality

### Phase 3: Selectors & Polish (Day 2-3)

1. Create AgentSelector and ModelSelector components
2. Add export functionality
3. Implement keyboard shortcuts
4. Visual regression testing and refinements

### Rollback Strategy

- Feature flags for new UI components
- Ability to revert to previous design if critical issues found
- Gradual rollout to subset of users first

## Risks & Mitigations

### Risk: Breaking existing functionality

**Mitigation**: Comprehensive testing checklist, maintain existing API contracts, feature flags for gradual rollout

### Risk: Performance degradation with animations

**Mitigation**: Use Framer Motion's optimized animations, test on lower-end devices, provide reduced motion option

### Risk: Accessibility regressions

**Mitigation**: Keyboard navigation testing, screen reader testing, maintain ARIA labels, focus management

### Risk: Design-implementation mismatch

**Mitigation**: Pixel-perfect comparison with prototype, designer review before final deployment, iterative refinements

## Open Questions

1. **Mobile responsiveness**: Should we implement a mobile-specific layout or maintain desktop-only for now?
   - **Decision**: Desktop-first, mobile optimization in future phase

2. **Voice input**: Should we implement actual voice input or keep as UI placeholder?
   - **Decision**: UI placeholder only, actual implementation deferred

3. **Export formats**: Should we support additional formats beyond JSON/Markdown?
   - **Decision**: JSON/Markdown only for now, extensible for future formats

4. **Session limits**: Should we limit the number of sessions shown in the dropdown?
   - **Decision**: Show all sessions, implement search/filter in future if needed

## Success Metrics

- Visual match: 95%+ pixel-perfect match with prototype
- Performance: Panel animation < 300ms, no jank
- Accessibility: 100% keyboard navigable, WCAG AA compliant
- User feedback: Positive reception on session management improvements
- Adoption: Keyboard shortcuts used by 20%+ of power users
