# DWT Weather Narrative Review Packet

This packet turns the live weather-summary grammar into representative sample outputs for prose review.

Source of truth:

- [dwt_weather_0.1.0-alpha.1.js](V:\Programs\Git Repository\DWT\Modules\dwt_weather_0.1.0-alpha.1.js)
- [dwt_WEATHER_NARRATIVE_PERMUTATIONS.md](V:\Programs\Git Repository\DWT\Documentation\dwt_WEATHER_NARRATIVE_PERMUTATIONS.md)

Important note:

- These examples preserve the current sentence skeletons and phrasing.
- They are representative renderings, not a claim that the module can emit only these exact lines.
- Numeric values and event selections are chosen to illustrate live branches clearly.

## Surface Samples

### Surface 1: Inland, clear, dead calm

```text
At 62 degrees fahrenheit, the temperature is mild, and the skies are clear. Wind is dead calm.
```

### Surface 2: Coastal, light rain, moving wind, chop

```text
At 55 degrees fahrenheit, the temperature is mild, and the skies are cloudy with light rain. Wind is coming from the northeast at about 5 kts (6 mph). Sea chop is moderate.
```

### Surface 3: Offshore, heavy rain, strong wind, heavy chop

```text
At 48 degrees fahrenheit, the temperature is cold, and the skies are stormy with heavy rain. Wind is coming from the west-southwest at about 10 kts (12 mph). Sea chop is heavy.
```

### Surface 4: Elevated location

```text
At an elevation of 1200 feet, the temperature is cold, and the skies are overcast with light sleet. Wind is coming from the north-northeast at about 5 kts (6 mph).
```

### Surface 5: Surface page with depth token

```text
At a depth of 30 feet below the surface, the temperature is cold, and the skies are stormy with heavy snow. Wind is coming from the north at about 21 kts (24 mph).
```

Review note:

- This branch intentionally has no chop sentence because a non-elevation depth token suppresses chop.

### Surface 6: Dead calm water with explicit no-chop line

```text
At 58 degrees fahrenheit, the temperature is mild, and the skies are partly cloudy. Wind is dead calm. The sea surface is smooth, with no chop.
```

### Surface 7: Critical storm suffix

```text
At 41 degrees fahrenheit, the temperature is cold, and the skies are stormy with heavy rain. Wind is coming from the east at about 39 kts (45 mph). Sea chop is severe. A severe sea storm is in progress.
```

### Surface 8: Heat-event branch

```text
At 96 degrees fahrenheit, the temperature is hot, and the skies are clear. Wind is dead calm. A heavy heat wave is in progress.
```

## Underwater Samples

### Underwater 1: Unknown depth, dead calm current

```text
At an unknown depth, the water feels mild and the current is dead calm. Ambient light still reaches this depth, and visibility remains workable.
```

### Underwater 2: Sunlit but turbid water

```text
At a depth of 2 fathoms (12 feet), the water feels mild and the current is steady. Ambient light still reaches this depth, but suspended matter keeps visibility short.
```

### Underwater 3: Twilight zone

```text
At a depth of 12 fathoms (72 feet), the water feels cold and the current is moderate. Ambient light has fallen into a blue-green twilight, and visibility is short.
```

### Underwater 4: Aphotic zone

```text
At a depth of 30 fathoms (180 feet), the water feels cold and the current is strong. Ambient light is effectively gone here, leaving the water dark unless a light source is carried.
```

### Underwater 5: Critical current disturbance

```text
At a depth of 20 fathoms (120 feet), the water feels cold and the current is violent. Ambient light is effectively gone here, leaving the water dark unless a light source is carried. The current disturbance cuts it down further.
```

### Underwater 6: Event-active underwater line

```text
At a depth of 15 fathoms (90 feet), the water feels cold and the current is severe. Ambient light has fallen into a blue-green twilight, and visibility is short. The current disturbance cuts it down further. A severe maelstrom is in progress.
```

## Subterranean Samples

### Subterranean 1: Stable dead calm

```text
At an unknown depth, the air feels mild. The airflow is dead calm. Ambient visibility is dark by default, and only carried light or darkvision pushes beyond it.
```

### Subterranean 2: Light moisture

```text
At approximately 300 feet below the surface, the air feels warm, and light drip clings to the passages. The airflow is a faint draft. Ambient visibility is dark by default, and only carried light or darkvision pushes beyond it.
```

### Subterranean 3: Heavier moisture and airflow

```text
At approximately 800 feet below the surface, the air feels hot, and heavy drip clings to the passages. The airflow is a strong draft. Ambient visibility is dark by default, and only carried light or darkvision pushes beyond it.
```

### Subterranean 4: Critical airflow

```text
At approximately 1200 feet below the surface, the air feels warm. The airflow is severe. Ambient visibility is dark by default, and only carried light or darkvision pushes beyond it.
```

### Subterranean 5: Active hazard and event suffix

```text
At approximately 900 feet below the surface, the air feels hot. The airflow is heavy. Ambient visibility is dark by default, and only carried light or darkvision pushes beyond it. The active hazard further obscures the passages. A heavy cave in is in progress.
```

### Subterranean 6: Toxic fog style event line

```text
At approximately 600 feet below the surface, the air feels warm. The airflow is strong. Ambient visibility is dark by default, and only carried light or darkvision pushes beyond it. The active hazard further obscures the passages. A moderate toxic fog is in progress.
```

## Friction Points Exposed By The Samples

These examples make the current review priorities easier to see.

### 1. Surface narration is the most mature branch

Surface lines already read reasonably well because they carry:

- numeric temperature
- sky state
- precipitation
- wind direction
- wind speed
- optional sea-state language

### 2. Underwater narration is clear, but repetitive

The underwater branch works mechanically, but most lines reduce to:

- `the water feels <adj>`
- `the current is <strength>`
- one visibility sentence

That makes it readable, but not especially atmospheric.

### 3. Subterranean moisture wording is currently awkward

The live grammar can produce phrases like:

- `light drip clings to the passages`
- `heavy drip clings to the passages`

This is structurally valid, but it is one of the clearest candidates for a wording pass.

### 4. Event suffixes are mechanically clean, but tonally plain

The event tail:

```text
A <severity> <event> is in progress.
```

is consistent and useful, but reads more like a status bulletin than atmospheric narration.

### 5. The sentence skeletons repeat quickly

Even when the values change, the same handful of frames recur:

- `At <temp>, the temperature is <adj>...`
- `Wind is coming from the <dir>...`
- `Ambient visibility is dark by default...`

This suggests that a later flavor pass should focus on phrase-pool variation inside each environment branch rather than only on more data inputs.

## Suggested First Editorial Pass

If we want to begin revising prose without destabilizing logic, the best order is:

1. Rewrite the subterranean moisture clause first.
2. Decide whether the event suffix should stay technical or become more atmospheric.
3. Add modest phrase variation to underwater and subterranean summary lines.
4. Revisit surface wording last, because it is already the strongest branch.
