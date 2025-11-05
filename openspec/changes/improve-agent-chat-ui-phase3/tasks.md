# Implementation Tasks - Agent Chat UI Phase 3 (Latest Design)

## 1. Visual Design System Implementation

- [ ] 1.1 Update ChatPanel component structure
  - [ ] Set fixed width to 420px
  - [ ] Implement spring animation for slide-in effect
  - [ ] Apply dark theme colors (crust, surface0, mauve)
  - [ ] Add proper border styling
- [ ] 1.2 Refine header styling
  - [ ] Update header layout with MessageSquare icon
  - [ ] Style close button
  - [ ] Add bottom border separation
  - [ ] Apply consistent padding (px-4 py-3)
- [ ] 1.3 Update message bubble styling
  - [ ] Apply mauve background for user messages
  - [ ] Apply surface0 background for assistant messages
  - [ ] Set rounded corners (rounded-2xl)
  - [ ] Apply proper padding (px-4 py-2.5)
  - [ ] Set max width to 85%
  - [ ] Style timestamps with reduced opacity
- [ ] 1.4 Refine input area styling
  - [ ] Apply surface0 background with surface1 border
  - [ ] Add mauve focus ring
  - [ ] Style embedded send button with mauve background
  - [ ] Position agent/model selectors above input
- [ ] 1.5 Implement empty state design
  - [ ] Create centered layout with MessageSquare icon
  - [ ] Style icon container (w-16 h-16, rounded-2xl, bg-surface0)
  - [ ] Add "Start a Conversation" heading
  - [ ] Add descriptive text with repository name
  - [ ] Apply center alignment and proper spacing

## 2. Session Dropdown UI Enhancement

- [ ] 2.1 Create compact session selector button
  - [ ] Set button height to h-8
  - [ ] Apply surface0/50 background with surface1 border
  - [ ] Add ChevronDown icon on the right
  - [ ] Implement text truncation
  - [ ] Set full width with padding (px-3)
- [ ] 2.2 Implement dropdown menu structure
  - [ ] Set mantle background with surface0 border
  - [ ] Set dropdown width to 380px
  - [ ] Align dropdown to start (left)
  - [ ] Organize active sessions first
  - [ ] Add archived sessions section at bottom
- [ ] 2.3 Style active session items
  - [ ] Display session name with truncation
  - [ ] Show repository name in muted text (text-xs)
  - [ ] Display last active time on right (text-xs)
  - [ ] Add green dot indicator for active session
  - [ ] Implement hover state (hover:bg-surface0)
  - [ ] Apply consistent padding (px-3 py-2)
- [ ] 2.4 Implement archived session section
  - [ ] Add separator before archived section
  - [ ] Display "Archived" label in muted text
  - [ ] Apply reduced opacity (opacity-60) to archived items
  - [ ] Implement click to activate archived session
- [ ] 2.5 Add session management actions
  - [ ] Add "+ New Chat Session" option with Plus icon
  - [ ] Add "Archive Session" option with Archive icon
  - [ ] Add separators above actions
  - [ ] Implement archive/unarchive toggle

## 3. Inline Session Title Editing

- [ ] 3.1 Implement display mode
  - [ ] Show session name in small text (text-xs)
  - [ ] Display "Repo: [repository-name]" in muted text
  - [ ] Add Edit2 icon with hover effect (opacity-0 group-hover:opacity-50)
  - [ ] Make entire area clickable with hover effect
  - [ ] Apply proper padding (p-2) and rounded corners
- [ ] 3.2 Implement edit mode
  - [ ] Create input field with current session name
  - [ ] Auto-focus and select text on activation
  - [ ] Set compact height (h-7) and small text (text-xs)
  - [ ] Add Check and X buttons
- [ ] 3.3 Implement save/cancel logic
  - [ ] Handle Enter key to save
  - [ ] Handle Escape key to cancel
  - [ ] Handle Check button click to save
  - [ ] Handle X button click to cancel
  - [ ] Update session name in dropdown after save

## 4. Agent and Model Selector UI

- [ ] 4.1 Implement selector layout
  - [ ] Position selectors above message input
  - [ ] Add Plus button on left for attachments
  - [ ] Add Mic button on right for voice input
  - [ ] Set compact size (h-7 w-7) for all buttons
  - [ ] Apply ghost variant styling
  - [ ] Implement hover states (hover:bg-surface0/50)
  - [ ] Set small gaps (gap-1) between elements
- [ ] 4.2 Create AgentSelector component
  - [ ] Display current agent icon and name
  - [ ] Add ChevronDown icon
  - [ ] Implement dropdown with available agents
  - [ ] Apply compact button styling
- [ ] 4.3 Create ModelSelector component
  - [ ] Display current model name
  - [ ] Add ChevronDown icon
  - [ ] Implement dropdown with available models
  - [ ] Apply compact button styling

## 5. New Session Dialog

- [ ] 5.1 Create NewSessionDialog component
  - [ ] Implement modal dialog overlay
  - [ ] Add close button (X icon) in top-right
  - [ ] Set dialog title "New Chat Session"
  - [ ] Add descriptive text
  - [ ] Apply proper padding and spacing
- [ ] 5.2 Implement session name input
  - [ ] Create "Session Name" input field
  - [ ] Add placeholder text
  - [ ] Auto-focus input on dialog open
  - [ ] Apply design system styling
- [ ] 5.3 Implement repository selector
  - [ ] Create "Repository" dropdown
  - [ ] Add "Choose a repository..." placeholder
  - [ ] List all available repositories
  - [ ] Apply proper styling and hover states
  - [ ] Pre-select initialRepository if provided
- [ ] 5.4 Implement create/cancel actions
  - [ ] Enable "Create Session" button when form is valid
  - [ ] Apply mauve background to create button
  - [ ] Handle create button click
  - [ ] Handle cancel button click
  - [ ] Close dialog and switch to new session on create
  - [ ] Discard information on cancel

## 6. Testing & Quality Assurance

- [ ] 6.1 Visual regression testing
  - [ ] Compare with design prototype
  - [ ] Test all interactive states (hover, focus, active)
  - [ ] Test animations and transitions
  - [ ] Verify color consistency
  - [ ] Check spacing and alignment
- [ ] 6.2 Functional testing
  - [ ] Test session creation workflow
  - [ ] Test session rename workflow
  - [ ] Test session archive/unarchive
  - [ ] Test agent/model selection
  - [ ] Test message sending
- [ ] 6.3 Cross-browser testing
  - [ ] Test on Chrome
  - [ ] Test on Firefox
  - [ ] Test on Safari
  - [ ] Test on Edge
- [ ] 6.4 Accessibility testing
  - [ ] Test keyboard navigation
  - [ ] Test screen reader compatibility
  - [ ] Test focus management
  - [ ] Verify ARIA labels

## 7. Documentation & Validation

- [ ] 7.1 Update documentation
  - [ ] Document new UI components
  - [ ] Add usage examples
  - [ ] Update design system documentation
- [ ] 7.2 Code review
  - [ ] Review TypeScript types
  - [ ] Review error handling
  - [ ] Review accessibility
  - [ ] Review performance
- [ ] 7.3 Final validation
  - [ ] Run `openspec validate --strict`
  - [ ] Mark all tasks as complete
  - [ ] Verify all acceptance criteria met

---

**Estimated Effort**: 2-3 days  
**Priority**: High  
**Dependencies**: Phase 2 MVP must be completed
