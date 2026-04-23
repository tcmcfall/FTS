# FTS Weather Narration Style Standard

This document defines the target prose style for live weather narration in FTS.

Source references:

- [fts_QUIP_CANONICAL_STANDARD.md](./fts_QUIP_CANONICAL_STANDARD.md)
- [fts_WEATHER_NARRATIVE_PERMUTATIONS.md](./fts_WEATHER_NARRATIVE_PERMUTATIONS.md)
- [fts_WEATHER_NARRATIVE_REVIEW_PACKET.md](./fts_WEATHER_NARRATIVE_REVIEW_PACKET.md)

## Purpose

Weather narration should feel as though it belongs in the same world and voice family as the campaign quips, while remaining functional as a live status line.

That means:

- it should sound more atmospheric and spoken than it does now
- it should keep concrete weather information clear
- it should not try to force strict quip verse onto variable numeric data

## Core Decision

The live weather summary should be **quip-adjacent prose**, not a literal quip.

In practice:

- the summary line should borrow the rhythm, imagery, and spoken feel of the quips
- the summary line should not be required to rhyme
- the summary line should not be forced into 2/4/8-line stanza buckets
- any future true verse weather flavor should be added as a separate layer, not by overloading the factual summary line

## Relationship To The Quip Canon

The weather summary should inherit these elements from the quip standard:

- concrete imagery
- rhythmic spoken cadence
- maritime and Ghosts of Velen vocabulary
- sly, dry, or wistful tonal range
- setting-appropriate diction

The weather summary should not inherit these elements as hard requirements:

- strict rhyme schemes
- stanza line counts
- fully self-contained joke or twist endings

## Primary Functional Requirement

A GM or player should be able to understand the weather immediately.

So the narration must preserve:

- current physical conditions
- direction and movement where relevant
- severity changes
- important environment distinctions
- event-state clarity

Atmosphere is the goal, but clarity is the constraint.

## Voice Target

The ideal weather line should sound like something a harbor master, pilot, diver, ferryman, scout, or old tunnel-guide might actually say.

It should feel:

- natural when spoken aloud
- lightly literary rather than flowery
- grounded in place and weather
- more observant than performative

It should not feel:

- clinical
- modern
- over-explained
- archaic for its own sake
- pseudo-epic

## Style Rules

### 1. Prefer Rhythmic Prose Over Flat Status Language

Current wording often reports weather as though it were a logbook field. The target style should still report, but with a more natural spoken cadence.

Preferred:

```text
Cold rain drives in off the gray water, and the wind is out of the west.
```

Avoid:

```text
The temperature is cold, and the skies are stormy with heavy rain.
```

### 2. Lead With Sensation Or Scene When Possible

When the branch allows it, begin with what the weather feels or does, not with abstract status labels.

Preferred leads:

- rain driving in
- bells muffled in fog
- the sea lying smooth
- green light thinning below
- stone sweating in the dark
- a draft moving down the passage

### 3. Keep Data-Bearing Clauses Plain

The factual payload should stay simple once introduced.

Good:

- `The wind is out of the west-southwest at about 10 kts (12 mph).`
- `The current is strong here.`
- `Visibility is short.`

Bad:

- poeticized numbers
- tangled compound clauses that hide direction or severity

### 4. Favor Concrete Nouns

Prefer:

- gulls
- foam
- tide
- chop
- rigging
- lanterns
- stone
- seep
- draft
- silt
- reef
- bell
- surf

Over:

- generic abstractions like `conditions`, `state`, `situation`, `factors`

### 5. Use Setting-Fit Verbs

Prefer verbs with physical presence:

- drives
- lies
- runs
- lifts
- shuts
- drags
- presses
- thins
- sweats
- clings
- gathers
- breaks

Avoid verbs that sound technical or bureaucratic:

- indicates
- reflects
- demonstrates
- remains in progress

### 6. Avoid Mechanical Repetition

Do not let most lines fall into the same shell:

- `At <temp>, the temperature is...`
- `Wind is coming from...`
- `Ambient visibility is...`

Instead, vary openings and clause order while preserving the same facts.

### 7. Do Not Over-Ornament

The line should feel authored, not embellished to death.

Avoid:

- forced alliteration everywhere
- constant inversion
- faux-medieval padding
- trying to make every line sound profound

## Environment Voice Guides

### Surface

Surface narration should be the most maritime and socially grounded branch.

Preferred image fields:

- docks
- gulls
- rigging
- surf
- harbor mouths
- bells
- lanterns
- gray water
- foam
- rain off the bay

Preferred feel:

- weather seen and worked in by coastal people

Target tone:

- steady
- seasoned
- practical
- occasionally wry

### Underwater

Underwater narration should feel physical, muffled, and spatial.

Preferred image fields:

- green light
- dim water
- pressure
- silt
- surge
- reef shadow
- dark below
- cold through the bones
- current against hull or body

Preferred feel:

- less like open-air weather
- more like movement, light loss, and pressure in a body of water

Target tone:

- quiet
- eerie
- compressed
- alert

### Subterranean

Subterranean narration should feel close, damp, dusty, or breathless depending on the condition.

Preferred image fields:

- sweating stone
- wet walls
- seep
- dust
- stale air
- drafts in cracks
- dark swallowing distance
- lamps dying short
- tunnel breath

Preferred feel:

- enclosed
- pressurized
- tactile
- uneasy

Target tone:

- restrained
- uncanny
- practical

## Structural Recommendation

The target summary line should use this hierarchy:

1. atmospheric lead
2. plain factual clause
3. optional reinforcing clause
4. optional direct event tag

This is the recommended model by environment.

### Surface Model

```text
<ATMOSPHERIC_LEAD>. <PLAIN_WIND_CLAUSE>[ <SEA_STATE_CLAUSE>][ <EVENT_TAG>]
```

Example:

```text
Cold rain drives in off the gray water and the sky has shut to storm. The wind is out of the west-southwest at about 10 kts (12 mph). The sea is running in heavy chop.
```

### Underwater Model

```text
<LIGHT_OR_DEPTH_LEAD>. <PLAIN_CURRENT_CLAUSE>[ <VISIBILITY_CLAUSE>][ <EVENT_TAG>]
```

Example:

```text
Green light has thinned to twilight at this depth. The current is strong here. Visibility is short.
```

### Subterranean Model

```text
<AIR_OR_STONE_LEAD>. <PLAIN_AIRFLOW_OR_MOISTURE_CLAUSE>[ <VISIBILITY_CLAUSE>][ <EVENT_TAG>]
```

Example:

```text
The stone sweats warm and the passage holds a clammy damp. A faint draft is moving through. Sight dies quickly beyond carried light.
```

## Event Tag Recommendation

The current event suffix is functional but plain:

```text
A severe sea storm is in progress.
```

Two practical options exist.

### Option A: Keep It Direct

Use a short, cleaner bulletin form:

```text
Severe sea storm active.
```

Advantages:

- compact
- unambiguous
- easy to parse

### Option B: Make It Atmospheric But Controlled

Use a short world-native tag:

```text
A severe sea storm is running.
```

or

```text
A severe sea storm is abroad.
```

Advantages:

- more setting flavor

Risk:

- can sound mannered if overused

Recommendation:

- start with Option A or a very restrained version of Option B
- do not make event tags the most poetic part of the weather line

## Before And After Examples

These examples show the direction of change.

### Surface

Current:

```text
At 48 degrees fahrenheit, the temperature is cold, and the skies are stormy with heavy rain. Wind is coming from the west-southwest at about 10 kts (12 mph). Sea chop is heavy.
```

Target:

```text
Cold rain drives in off the gray water and the sky has shut to storm. The wind is out of the west-southwest at about 10 kts (12 mph). The sea is running in heavy chop.
```

### Surface Dead Calm

Current:

```text
At 58 degrees fahrenheit, the temperature is mild, and the skies are partly cloudy. Wind is dead calm. The sea surface is smooth, with no chop.
```

Target:

```text
The air is mild and the cloud sits broken overhead. There is no wind to speak of, and the water lies smooth.
```

### Underwater

Current:

```text
At a depth of 12 fathoms (72 feet), the water feels cold and the current is moderate. Ambient light has fallen into a blue-green twilight, and visibility is short.
```

Target:

```text
The green light has fallen thin at this depth, and the water bites cold. A moderate current is running here, and visibility is short.
```

### Underwater Critical

Current:

```text
At a depth of 20 fathoms (120 feet), the water feels cold and the current is violent. Ambient light is effectively gone here, leaving the water dark unless a light source is carried. The current disturbance cuts it down further.
```

Target:

```text
Below this depth the light is nearly spent, and the water has gone hard and black. A violent current is running here, and sight is worse where the surge tears through.
```

### Subterranean Moisture

Current:

```text
At approximately 300 feet below the surface, the air feels warm, and light drip clings to the passages. The airflow is a faint draft. Ambient visibility is dark by default, and only carried light or darkvision pushes beyond it.
```

Target:

```text
The stone is warm here and a thin damp sits on the passage walls. A faint draft is moving through, and sight dies quickly beyond carried light.
```

### Subterranean Event

Current:

```text
At approximately 900 feet below the surface, the air feels hot. The airflow is heavy. Ambient visibility is dark by default, and only carried light or darkvision pushes beyond it. The active hazard further obscures the passages. A heavy cave in is in progress.
```

Target:

```text
The dark is close and the air is hot against the stone. A heavy draft is moving through, and the passage closes quickly beyond the lantern. Heavy cave-in active.
```

## Implementation Guidance

If this standard is adopted, the code change should be done conservatively.

### Recommended Method

- keep the existing environment routing
- keep the existing condition logic
- keep the existing numeric and severity derivation
- replace fixed summary phrases with small phrase pools or branch-specific rewrite functions

### Good First Scope

- rewrite subterranean moisture wording
- rewrite subterranean visibility wording
- rewrite underwater visibility wording
- decide the final event-tag style

### Defer For Later

- adding true verse lines to the live weather summary
- large randomized phrase pools in every branch
- mixing heavy quip logic directly into factual weather construction

## Acceptance Rules

A revised weather narration line should satisfy all of the following:

- clear enough to parse at a glance
- spoken-feeling rather than bureaucratic
- grounded in concrete weather or place imagery
- setting-appropriate for Ghosts of Velen
- not forced into rhyme
- not dependent on one repeated sentence shell
- compatible with numeric inserts where needed

## Working Recommendation

The best next implementation pass is:

1. rewrite the subterranean branch into better rhythmic prose
2. rewrite the underwater branch in the same direction
3. standardize a restrained event-tag style
4. revisit the surface branch only after the weaker branches are improved
