# Screenshots

This folder contains screenshots for the main README.md documentation.

## Required Screenshots

### 1. `ui-main.png`
**What to capture:**
- Main interface showing the natural language input field at the top
- Configuration panel on the left with scenario tabs (Dice, Cards, Binomial)
- Results panel on the right with a probability result
- Run history panel visible below results (if available)
- Show both light and dark mode variants if desired

**Purpose:** Primary screenshot showing the full UI layout and natural language input feature.

**Referenced in README at line 100**

### 2. `parse-failure.png`
**What to capture:**
- Natural language input field with text that cannot be parsed
- Error message showing the layered explanation:
  - Primary message: "I couldn't confidently interpret that input..."
  - Secondary content: "Examples I can understand" with bullet points
  - Transform hint: egg-breaking example

**Purpose:** Demonstrate the helpful error messages and teaching approach.

**Referenced in README at line 103**

### 3. `run-history.png`
**What to capture:**
- Run history panel (labeled "Recent experiments")
- 3-5 history entries showing:
  - Scenario badges (dice, cards, binomial)
  - Exact/Estimate badges with CI widths
  - Probability percentages
  - Condition summaries in monospace font
  - Hover state on one entry (if possible)

**Purpose:** Show the run history feature and restore-and-rerun functionality.

**Referenced in README at line 106**

## Screenshot Guidelines

- **Resolution:** At least 1200px wide for clarity
- **Format:** PNG with transparency where applicable
- **Naming:** Exactly as listed above (lowercase, hyphens)
- **Content:** Real UI, not mockups or fabricated content
- **Theme:** Light mode preferred for better visibility, but dark mode acceptable
- **Browser:** Any modern browser (Chrome, Firefox, Safari)

## How to Take Screenshots

1. Run the dev servers: `npm run dev`
2. Open `http://localhost:3000` in your browser
3. For `ui-main.png`:
   - Enter a natural language query and run it
   - Ensure results are visible
   - Capture the full window
4. For `parse-failure.png`:
   - Enter unparseable text (e.g., "asdf" or "what are the chances of rain tomorrow")
   - Wait for error message to appear
   - Capture the ConfigPanel area
5. For `run-history.png`:
   - Run 3-5 different scenarios
   - Scroll to the history panel below results
   - Capture the "Recent experiments" section

## Mac Screenshot Instructions

**Saving screenshots as files (not clipboard):**

- **Cmd + Shift + 4** (select area) → saves to Desktop by default as `Screen Shot YYYY-MM-DD at HH.MM.SS.png`
- **Cmd + Shift + 5** → opens screenshot toolbar with more options:
  - Click "Options" to choose save location (Desktop/Documents recommended)
  - Select capture mode (window, selection, entire screen)

**Important:** If screenshot goes to clipboard instead of saving a file, you held **Ctrl** by mistake. Use **Cmd + Shift + 4** WITHOUT Ctrl.

**Moving files into the screenshots folder:**

Option 1 - Finder:
1. Open Finder to Desktop
2. Drag and drop screenshot file into `~/chances-of/screenshots/`
3. Rename to exact required filename (`ui-main.png`, `parse-failure.png`, or `run-history.png`)

Option 2 - Terminal:
```bash
# From project root (~/chances-of)
mv ~/Desktop/Screen\ Shot*.png screenshots/ui-main.png

# Or if already renamed on Desktop:
mv ~/Desktop/ui-main.png screenshots/ui-main.png
```

## Recommended Scenarios for Each Screenshot

### For `ui-main.png`:
Use a dice example that shows clear results:
- **Natural language input:** "roll 2d6, sum at least 7"
- This should parse successfully and show results panel with ~58.3% probability
- Shows NL input working, config panel, and results panel

### For `parse-failure.png`:
Use an out-of-domain query to trigger the parse failure UI:
- **Natural language input:** "What are the chances my sandwich goes off in 3 days?"
- After the false-positive fix, this should show the error panel with:
  - "I couldn't confidently interpret that input..."
  - Examples of valid inputs
  - Transform hint about egg-breaking scenario
- Capture the entire ConfigPanel area showing the error state

### For `run-history.png`:
Run these scenarios in sequence to populate history:
1. "roll 2d6, sum at least 7"
2. "draw 5 cards, get 2 aces"
3. "12 trials at 5% chance, at least 1 success"
4. "3d20 max at least 15"
5. "draw 7 cards, any hearts"

Then scroll to the "Recent experiments" panel and capture all 5 entries showing different scenario types, badges, and probabilities.

## Placeholder Status

Until screenshots are added, the README will show broken image links. This is expected and serves as a reminder to add real screenshots before promoting the repository.

## Adding Screenshots

1. Take screenshots following the guidelines above
2. Save them to this directory with exact filenames
3. Commit and push to repository
4. Verify images appear correctly in README on GitHub

---

**Note:** Do not fabricate or mockup screenshots. Only use real captures of the running application.
