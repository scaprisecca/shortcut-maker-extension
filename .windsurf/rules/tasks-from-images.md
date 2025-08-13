---
trigger: manual
---

---
description: Rule for generating tasks to build a component from a image
---

# Rule: Generating a Task List from an Image Component Reference

## Goal

To guide an AI assistant in generating a detailed, step-by-step task list for building a web component by analyzing a reference image. The task list should break down all necessary implementation steps as if a junior developer will be building the component.

## Output

* **Format:** Markdown (`.md`)
* **Location:** `/build-plan/tasks/`
* **Filename:** `tasks-[component-name].md` (e.g., `tasks-market-overview-redesign.md`)

## Process

1. **Receive Image Reference:**
   The user provides the AI with an image file of a web component (e.g., `@market-overview-summary-section.png`).

2. **Analyze Image:**
   The AI examines the visual structure, layout, UI elements, typography, spacing, and interactive elements visible in the image. Use reasoning to infer component composition even if some details are not explicitly clear.

3. **Color System Enforcement:**

   * Do **NOT** copy or extract colors directly from the image.
   * Instead, all color assignments must use the official color palette defined in the `style-guide.md` file located at `.cursor/rules/style-guide.md`.
   * If specific colors are not defined for certain elements, apply reasonable defaults from the palette based on UI/UX design principles (e.g., contrast, hierarchy, emphasis).
   * Include references in the tasks that clarify which colors from the palette are being applied to which parts of the component.

4. **Validate UI/UX Best Practices:**

   * Evaluate the image against established UI/UX best practices.
   * If any design improvements, accessibility issues, or usability enhancements are identified, incorporate these into the task breakdown.
   * Include recommendations for consistency, alignment, spacing, hierarchy, contrast, responsiveness, and interactivity based on modern UI/UX standards.
   * Ensure typography, sizing, white space, layouts, and component hierarchies reflect good design system principles.

5. **Phase 1: Generate High-Level Parent Tasks:**

   * Generate approximately 5–7 high-level parent tasks that describe the major development steps needed to replicate the component visually and functionally.
   * Focus on clear task titles understandable to a junior developer.
   * Present these parent tasks in Markdown format, without sub-tasks yet.
   * Inform the user:
     `"I have generated the high-level tasks based on the image reference. Ready to generate the sub-tasks? Respond with 'Go' to proceed."`

6. **Wait for Confirmation:**
   Pause until the user responds with `"Go"` before proceeding.

7. **Phase 2: Generate Sub-Tasks:**

   * For each parent task, generate detailed sub-tasks describing specific implementation steps.
   * Include decisions about layout structure, component decomposition, file creation, state management, responsiveness, accessibility, and styling.
   * Assume TailwindCSS, TypeScript, React, and modern UI/UX frameworks (e.g., Shadcn, Radix) are available.
   * Ensure sub-tasks reflect any UI/UX improvements or recommendations identified earlier.

8. **Identify Relevant Files:**

   * Based on the tasks, propose which files need to be created or modified.
   * Include component files, utility files, and test files.
   * Describe the purpose of each file briefly.

9. **Generate Final Output:**

   * Combine the parent tasks, sub-tasks, relevant files, and notes into the final Markdown structure.

10. **Save Task List:**

* Save the document into `/build-plan/tasks/` directory with filename `tasks-[component-name].md`, where `[component-name]` matches the base name of the image file.

## Output Format

The generated task list **must** follow this structure:

```markdown
## Relevant Files

- `components/MarketOverviewSummarySection.tsx` - Main component for the market overview summary section.
- `components/MarketOverviewSummarySection.test.tsx` - Unit tests for MarketOverviewSummarySection.
- `lib/utils/formatters.ts` - Utility functions for formatting currency, percentages, etc.
- `lib/utils/formatters.test.ts` - Unit tests for formatters.

### Notes

- Follow component-based design: isolate reusable components.
- Use TailwindCSS utility classes for styling.
- Use colors exclusively from `/design/color-palette.md` — do not extract colors from image.
- Include accessibility best practices (ARIA roles, keyboard navigation).
- Ensure all design elements follow UI/UX best practices for alignment, hierarchy, spacing, color contrast, and responsiveness.
- Tests should be colocated with components when possible.

## Tasks

- [ ] 1.0 Setup Component Structure
  - [ ] 1.1 Create new component file: `MarketOverviewSummarySection.tsx`
  - [ ] 1.2 Define base layout with containers, sections, and wrappers
  - [ ] 1.3 Scaffold placeholder content

- [ ] 2.0 Layout & Responsive Design
  - [ ] 2.1 Implement grid or flexbox layouts
  - [ ] 2.2 Verify responsive behavior for mobile, tablet, desktop

- [ ] 3.0 Implement Individual UI Elements
  - [ ] 3.1 Header Section
  - [ ] 3.2 Metric Cards
  - [ ] 3.3 Charts / Graphs

- [ ] 4.0 Styling & Theming
  - [ ] 4.1 Apply color palette from `/design/color-palette.md`
  - [ ] 4.2 Apply typography settings
  - [ ] 4.3 Add hover/focus/active states
  - [ ] 4.4 Apply consistent spacing, sizing, and alignment per UI/UX best practices

- [ ] 5.0 Data Integration (if applicable)
  - [ ] 5.1 Define props and data interfaces
  - [ ] 5.2 Mock initial data

- [ ] 6.0 Accessibility & ARIA Compliance

- [ ] 7.0 Unit Testing
```

## Interaction Model

* Explicit 2-phase model:

  * Phase 1: Generate parent tasks, wait for user confirmation.
  * Phase 2: Generate detailed sub-tasks.

## Target Audience

Assume the primary reader of the task list is a **junior front-end developer** familiar with React, TypeScript, TailwindCSS, Shadcn, and component-based development workflows, and who benefits from clear UI/UX design guidance.

---
