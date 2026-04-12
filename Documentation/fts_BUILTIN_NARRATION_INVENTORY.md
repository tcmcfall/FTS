# FTS Built-in Narration Inventory

Generated on 2026-03-28 from the runtime modules in this workspace.

Historical note: this inventory records the pre-overhaul narration layout and is no longer authoritative for the current quip architecture.

## Scope

- Included: built-in quips, fallback flavor text, critical-event summaries, effect descriptors, and the weather narrative templates that assemble player/GM-facing descriptive output.
- Excluded: command help, button labels, schema/config labels, data-source notes, and other non-atmospheric UI text.
- Region modules are listed for completeness. They currently configure weather logic and event weights, but do not ship their own narration pools.

## Module Coverage

| Module | Built-in narration | Notes |
| --- | --- | --- |
| `Modules/fts_calendar_0.2.0-alpha.1.js` | Yes | Festival overlay lines plus calendar-local fallback festival quips. |
| `Modules/fts_core_0.2.0-alpha.1.js` | No | Command shell, help, and UI text only; no atmospheric narration pool. |
| `Modules/fts_geo_0.2.0-alpha.1.js` | No | Route/location logic only; no built-in narration pool. |
| `Modules/fts_mapMeta_0.2.0-alpha.1.js` | No | Map metadata summaries only; no atmospheric narration pool. |
| `Modules/fts_quips_0.1.0-alpha.1.js` | Yes | Authoritative quip corpus (festival, season, generic, and region pools). |
| `Modules/fts_mapRegionWizard_0.2.0-alpha.1.js` | No | Generator/preset descriptions only; no runtime narration pool. |
| `Modules/fts_weather_0.2.0-alpha.1.js` | Yes | Fallback weather quips, critical-event summaries/effect descriptors, and dynamic narrative templates. |
| `Modules/Region Modules/fts_region.frozenfar_0.1.0-alpha.1.js` | No | Region configuration only; no standalone narration strings beyond metadata notes. |
| `Modules/Region Modules/fts_region.landsofintrigue_0.1.0-alpha.1.js` | No | Region configuration only; no standalone narration strings beyond metadata notes. |
| `Modules/Region Modules/fts_region.moonshaes_0.1.0-alpha.1.js` | No | Region configuration only; no standalone narration strings beyond metadata notes. |
| `Modules/Region Modules/fts_region.swordcoastnorth_0.1.0-alpha.1.js` | No | Region configuration only; no standalone narration strings beyond metadata notes. |
| `Modules/Region Modules/fts_region.swordcoast_0.1.0-alpha.1.js` | No | Region configuration only; no standalone narration strings beyond metadata notes. |

## Calendar Module

Source: `Modules/fts_calendar_0.2.0-alpha.1.js`

- Festival overlay one-liners: 6
- Calendar-local festival fallback quips: 32
- Generic festival fallback quips: 4
- Note: `festivalQuip()` is defined but not referenced elsewhere in the current calendar module; the rendered festival view currently uses `resolveFestivalLongQuip()` instead.

### Festival Overlay One-Liners

#### `midwinter`

```text
The longest night; the hearth burns brighter.
```

#### `greengrass`

```text
Old oaths awaken in new leaves.
```

#### `midsummer`

```text
Sun at its crown-nothing stays hidden.
```

#### `shieldmeet`

```text
Once in four years, the world holds its breath.
```

#### `highharvestide`

```text
The reaping comes; so do the debts.
```

#### `feastofthemoon`

```text
The moon counts what mortals misplace.
```

### Calendar-Local Festival Fallback Quips

#### `midwinter` (4 entries)

1.
```text
The longest night; the hearth burns brighter.
Even old grudges thaw a little when the door is shut.
If you must make a vow, make it softly.
Tomorrow is earned by staying warm tonight.
```

2.
```text
Ice in the gutters, fire in the bones.
A shared cup counts for more than a shared sword.
Speak the names you miss, then let them rest.
The year turns when the last ember refuses to die.
```

3.
```text
Snow keeps counsel and shutters keep secrets.
Bread is broken, not promises.
The brave endure the dark by tending light.
Midwinter teaches patience to all who listen.
```

4.
```text
When the wind howls, the city leans inward.
A table becomes a fortress, laughter its guard.
Let the cold take what it can-never your kindness.
Midwinter passes; what you keep remains.
```

#### `greengrass` (4 entries)

1.
```text
New leaves, old oaths.
What slept beneath the frost remembers how to rise.
Plant one honest thing and guard it well.
Greengrass rewards the patient hand.
```

2.
```text
The ground softens, and so do hard hearts.
Even stone streets smell faintly of green.
Begin small; the year will carry it.
Greengrass is permission to try again.
```

3.
```text
Rains rinse the soot from winter's edges.
Promises sprout where doubt once sat.
Share seed, share story, share time.
Greengrass makes room for mercy.
```

4.
```text
A bud is a bargain with the future.
You do not need certainty to begin.
Tie your hopes to living things.
Greengrass will do the rest.
```

#### `midsummer` (4 entries)

1.
```text
Sun at its crown-nothing stays hidden.
Lanterns and laughter crowd out careful silence.
Spend your joy while the night is long.
Midsummer remembers those who dared to dance.
```

2.
```text
Torches flare, and shadows surrender.
The city forgets its measured pace for one bright span.
Say what you mean before dawn returns.
Midsummer does not wait for permission.
```

3.
```text
Heat hangs thick, but spirits run light.
A kiss can be a treaty for a night.
Let the music carry what words cannot.
Midsummer makes boldness feel easy.
```

4.
```text
The longest day lends courage to fools and sages alike.
Drink deep, then tell the truth.
Joy is a kind of strength when shared.
Midsummer proves it.
```

#### `shieldmeet` (4 entries)

1.
```text
Once in four years, the world holds its breath.
Charters are read where all may hear.
A promise spoken plainly is a shield.
Shieldmeet weighs the city's soul.
```

2.
```text
No feast outruns the law tonight.
Hands are raised, not blades.
Legitimacy is built in daylight.
Shieldmeet remembers who stood accountable.
```

3.
```text
The bells ring, and the crowd answers-steady, not loud.
Justice prefers clear words over sharp steel.
Choose carefully; the year will quote you.
Shieldmeet binds what you decide.
```

4.
```text
Open doors, open records, open eyes.
Power is safest when it can be questioned.
Let governance be seen to be believed.
Shieldmeet makes the hidden visible.
```

#### `highharvestide` (4 entries)

1.
```text
The reaping comes; so do the debts.
Count what you gained and what it cost.
Set aside a share for storms you cannot name.
Highharvestide honors honest accounting.
```

2.
```text
Full barns, full hearts-if you keep them that way.
Gratitude is measured in portions given away.
Close the ledgers with clean hands.
Highharvestide rewards restraint.
```

3.
```text
Bread on the table is victory enough.
The year was heavy; let the harvest be kind.
Pay your tithes, then feed your neighbors.
Highharvestide steadies the coming cold.
```

4.
```text
Markets quiet after the last tally.
You cannot eat coin, but you can share food.
Store wisely; celebrate gently.
Highharvestide teaches the difference.
```

#### `feastofthemoon` (4 entries)

1.
```text
The moon counts what mortals misplace.
Set a chair for those who will not return.
Tell their stories until they feel near again.
The Feast of the Moon is gentleness made ritual.
```

2.
```text
A quiet table holds more than a loud hall.
Names are spoken like prayers and passed like bread.
Grief sits down, and comfort follows.
The Feast of the Moon keeps families whole.
```

3.
```text
Candlelight does not banish loss, but it makes room to breathe.
Share what you remember, not what you regret.
Let the sea keep its secrets; keep your love.
The Feast of the Moon asks nothing more.
```

4.
```text
Moonlight on the floor, warm hands in the dark.
No bargains tonight-only belonging.
The year slows long enough to listen.
The Feast of the Moon is that pause.
```

#### `uktar` (4 entries)

1.
```text
Rot settles in where warmth once lay.
The year exhales its final breath without apology.
What spoils now will feed what comes next.
Uktar teaches endings without cruelty.
```

2.
```text
Fog thickens, cellars dampen, and patience becomes a skill.
Do not curse decay; it is honest work.
Clear what must be cleared before the frost.
Uktar makes room for renewal.
```

3.
```text
Leaves collapse to paste and roads turn slick.
The world shows its under-side: worms, mold, and root.
Prepare, preserve, and do not pretend.
Uktar is truth in brown and gray.
```

4.
```text
Nothing stays sweet forever.
The wise learn when to seal the jar and bank the fire.
Decay is a messenger, not a verdict.
Uktar's lesson is readiness.
```

#### `midwinters_eve` (4 entries)

1.
```text
A breath between what was and will.
No oaths demanded, no banners raised.
Release the old year gently and keep only what matters.
Midwinter's Eve lets the turning happen.
```

2.
```text
The lamps burn low and the city listens.
Forgive what you can; remember what you must.
Tomorrow arrives whether invited or not.
Year's Turning is humility made visible.
```

3.
```text
Time pauses long enough to be felt.
Set down the weight you carried and pick up something kinder.
The circle closes, then begins.
Midwinter's Eve is the hinge.
```

4.
```text
The old year steps back without ceremony.
The new year waits without a name.
Between them lies one quiet night to breathe.
Year's Turning belongs to everyone.
```

### Generic Festival Fallback Quips

1.
```text
The calendar turns, and the world turns with it.
Some nights are for noise; some are for noticing.
Hold what matters and let the rest pass.
The year will make room.
```

2.
```text
A festival is a stitch in time.
It holds the days together when they threaten to fray.
Share a word, share a fire, share a moment.
That is enough.
```

3.
```text
Old seasons end; new ones arrive.
Ritual gives shape to change.
Stand with others and breathe through the turning.
The world continues.
```

4.
```text
Whether the streets roar or the hearth whispers, the meaning is the same.
Remember, repair, rejoice, renew.
The day is marked because you marked it.
Carry that forward.
```

## Quips Corpus Module

Source: `Modules/fts_quips_0.1.0-alpha.1.js`

- Lookup paths: 51
- Total authored quip entries: 1900
- Festival entries: 807
- Season entries: 461
- Region/generic entries: 632
- Note: `Modules/Quip Modules/text/*.txt` appear to be source text assets that feed this corpus, but the runtime module listed here is the authoritative built-in store.

### Festival Pools

#### `feastofthemoon`

##### `quips.festival.feastofthemoon.long` (20 entries)

1.
```text
On Waterdeep's long candlelit table,
The bread is shared, the wine passed slow,
Feast of the Moon makes kinship able,
And lets remembered faces glow,
A place is set for those not here,
With cup poured full and candle lit,
The absence feels both sharp and near,
Yet held within the love we sit.
```

2.
```text
In Amn the doors are closed at dusk,
No trade outpaces family call,
Feast of the Moon lifts winter husk,
And feeds the heart that bore it all,
The elders speak of years gone by,
Of leaner times and kinder hands,
The children listen, wide of eye,
And learn how memory understands.
```

3.
```text
In Calimshan the incense curls,
And elders speak the names once known,
Feast of the Moon gathers boys and girls,
To learn the past they've never grown,
The stories wind like patient thread,
Through heat and hardship, loss and care,
The living walk where others tread,
And find their footing waiting there.
```

4.
```text
In Tethyr halls the banners rest,
No song is sung to stir the crowd,
Feast of the Moon prefers the chest,
Where gratitude is spoken loud,
The hearth burns low, the voices lean,
Toward truths no trumpet ever told,
The night remembers what has been,
And guards the fragile young and old.
```

5.
```text
At Baldur's Gate the harbor sighs,
As lamps burn low along the quay,
Feast of the Moon lifts weary eyes,
And lets the present simply be,
The tide runs slow as if to hear,
The names whispered against the foam,
The sea keeps what we hold most dear,
Yet brings our living bodies home.
```

6.
```text
In Saltmarsh nets are left alone,
As tables fill with fish and bread,
Feast of the Moon brings sailors home,
To names remembered, not the dead,
A bowl is set beside the fire,
For those who won't return again,
The meal grows warm with shared desire,
To hold the past without the pain.
```

7.
```text
Moonlight pools on window sill,
As stories pass from hand to hand,
Feast of the Moon asks hearts be still,
And hear the past we understand,
No voice is raised to drown the rest,
No boast outruns the quiet room,
The night itself becomes the guest,
Who teaches how all lives resume.
```

8.
```text
In Amn the elders nod and smile,
At tales retold from year to year,
Feast of the Moon reminds us while,
Why bonds outlast both loss and fear,
The children learn the names by heart,
Of those whose work made plenty sure,
The future grows where stories start,
And memory becomes the cure.
```

9.
```text
Calimshan streets grow hushed and deep,
The music traded for recall,
Feast of the Moon lets secrets sleep,
And answers those who softly call,
The candles burn to stubs of wax,
Yet no one stirs to break the spell,
The night restores what daylight lacks,
And holds the truths we cannot tell.
```

10.
```text
In Tethyr fire burns low and clear,
No boast is made of sword or deed,
Feast of the Moon keeps memory near,
And honors want as well as need,
The prayers are brief, the silence long,
The bonds are felt, not over-said,
The hearth remembers where we belong,
And feeds the living with the dead.
```

11.
```text
At Baldur's Gate the bells don't ring,
The night prefers a gentler sound,
Feast of the Moon needs quieter things,
To keep the living safely bound,
The harbor lights reflect like stars,
Upon the water's steady skin,
The city loosens all its scars,
And lets remembrance settle in.
```

12.
```text
In Saltmarsh children hear old tales,
Of storms survived and loves once true,
Feast of the Moon sets gentler sails,
For hearts that don't yet know what's due,
The elders speak of loss and gain,
With equal weight and steady tone,
The past is not a chain of pain,
But roots from which the present's grown.
```

13.
```text
A toast is raised without a cheer,
Just lifted cups and meeting eyes,
Feast of the Moon keeps voices clear,
And lets the louder world pass by,
The wine tastes warm with shared regret,
And sweeter still with what remains,
The year is not forgotten yet,
Nor all its losses counted vain.
```

14.
```text
Moonlight silver on the floor,
As dishes clear and talking slows,
Feast of the Moon asks nothing more,
Than time to let the feeling close,
The candles gutter, one by one,
The night draws near its gentle end,
The meal is done, the bonds are spun,
And memory becomes a friend.
```

15.
```text
In Amn the shops stay shut all night,
No coin is weighed, no debt recalled,
Feast of the Moon sets the right,
That family outranks them all,
The ledgers sleep beneath the stairs,
The counting done for one full day,
The wealth is found in shared-up cares,
That do not fade or run away.
```

16.
```text
Calimshan names the years gone by,
And what they taught with patient care,
Feast of the Moon hears every sigh,
And keeps the wisdom there to share,
The children trace the moons in chalk,
Along the courtyard's cooling stone,
The past and present gently walk,
And neither one must stand alone.
```

17.
```text
In Tethyr watchmen walk more slow,
And nod to those they pass by name,
Feast of the Moon lets duty go,
Enough to feel the human flame,
The road lies quiet, safe and bare,
No caravan disturbs the night,
The law itself seems paused in prayer,
To honor love above its might.
```

18.
```text
At Baldur's Gate the tide runs slow,
As if the sea itself would wait,
Feast of the Moon lets feelings flow,
Without the push of time or fate,
The harbor holds its mirrored lights,
Like memories that will not sink,
The city breathes through softer nights,
And learns again how not to think.
```

19.
```text
In Saltmarsh smoke drifts pale and thin,
As hearths are banked and stories end,
Feast of the Moon settles in,
Where loss and comfort both can blend,
The nets are folded, work undone,
Until another rising day,
The sea accepts what we have won,
And keeps the rest along the way.
```

20.
```text
The night grows quiet, full, and slow,
As moonlight fills the waiting room,
Feast of the Moon lets memory flow,
And grants the past a gentle bloom,
No voice intrudes, no duty calls,
The present rests where love has been,
The year grows softer on these walls,
And leaves us held by what we mean.
```

##### `quips.festival.feastofthemoon.medium` (36 entries)

1.
```text
On Waterdeep's long candlelit table,
The bread is shared, the wine passed slow,
Feast of the Moon makes kinship able,
And lets remembered faces glow.
```

2.
```text
In Amn the doors are closed at dusk,
No trade outpaces family call,
Feast of the Moon lifts winter husk,
And feeds the heart that bore it all.
```

3.
```text
In Calimshan the incense curls,
And elders speak the names once known,
Feast of the Moon gathers boys and girls,
To learn the past they've never grown.
```

4.
```text
In Tethyr halls the banners rest,
No song is sung to stir the crowd,
Feast of the Moon prefers the chest,
Where gratitude is spoken loud.
```

5.
```text
At Baldur's Gate the harbor sighs,
As lamps burn low along the quay,
Feast of the Moon lifts weary eyes,
And lets the present simply be.
```

6.
```text
In Saltmarsh nets are left alone,
As tables fill with fish and bread,
Feast of the Moon brings sailors home,
To names remembered, not the dead.
```

7.
```text
A place is set for those not here,
With candle lit and cup poured wide,
Feast of the Moon keeps absence near,
But lets it rest beside our pride.
```

8.
```text
Moonlight pools on window sill,
As stories pass from hand to hand,
Feast of the Moon asks hearts be still,
And hear the past we understand.
```

9.
```text
In Amn the elders nod and smile,
At tales retold from year to year,
Feast of the Moon reminds us while,
Why bonds outlast both loss and fear.
```

10.
```text
Calimshan streets grow hushed and deep,
The music traded for recall,
Feast of the Moon lets secrets sleep,
And answers those who softly call.
```

11.
```text
In Tethyr fire burns low and clear,
No boast is made of sword or deed,
Feast of the Moon keeps memory near,
And honors want as well as need.
```

12.
```text
At Baldur's Gate the bells don't ring,
The night prefers a gentler sound,
Feast of the Moon needs quieter things,
To keep the living safely bound.
```

13.
```text
In Saltmarsh children hear old tales,
Of storms survived and loves once true,
Feast of the Moon sets gentler sails,
For hearts that don't yet know what's due.
```

14.
```text
A toast is raised without a cheer,
Just lifted cups and meeting eyes,
Feast of the Moon keeps voices clear,
And lets the louder world pass by.
```

15.
```text
Moonlight silver on the floor,
As dishes clear and talking slows,
Feast of the Moon asks nothing more,
Than time to let the feeling close.
```

16.
```text
In Amn the shops stay shut all night,
No coin is weighed, no debt recalled,
Feast of the Moon sets the right,
That family outranks them all.
```

17.
```text
Calimshan names the years gone by,
And what they taught with patient care,
Feast of the Moon hears every sigh,
And keeps the wisdom there to share.
```

18.
```text
In Tethyr watchmen walk more slow,
And nod to those they pass by name,
Feast of the Moon lets duty go,
Enough to feel the human flame.
```

19.
```text
At Baldur's Gate the tide runs slow,
As if the sea itself would wait,
Feast of the Moon lets feelings flow,
Without the push of time or fate.
```

20.
```text
In Saltmarsh smoke drifts pale and thin,
As hearths are banked and stories end,
Feast of the Moon settles in,
Where loss and comfort both can blend.
```

21.
```text
A chair stays empty by design,
No word is said, but all agree,
Feast of the Moon keeps the line,
Between what was and what must be.
```

22.
```text
On Waterdeep's broad family row,
The night runs long, the voices soft,
Feast of the Moon lets patience grow,
And lifts the past where it was lost.
```

23.
```text
In Amn the children learn the names,
Of those who worked the fields before,
Feast of the Moon lights steady flames,
That guide the living evermore.
```

24.
```text
Calimshan tea grows sweet and slow,
As elders tell of harder days,
Feast of the Moon lets children know,
Why hope is earned in quieter ways.
```

25.
```text
In Tethyr hearthstones glow like gold,
As hands are clasped and prayers said,
Feast of the Moon guards young and old,
By keeping memory well-fed.
```

26.
```text
At Baldur's Gate the lamps burn low,
And doors stay open late and kind,
Feast of the Moon lets the past show,
Without demanding we rewind.
```

27.
```text
In Saltmarsh the sea is thanked aloud,
For those returned and those not so,
Feast of the Moon makes peace allowed,
With tides we'll never fully know.
```

28.
```text
A prayer said without reply,
Yet answered in the holding hand,
Feast of the Moon lets questions lie,
And trusts the love we understand.
```

29.
```text
Moon climbs high, the night stays warm,
As plates are cleared and silence grows,
Feast of the Moon keeps the form,
Of care that no loud promise shows.
```

30.
```text
In Amn the elders bless the young,
With stories more than words or gold,
Feast of the Moon keeps wisdom sung,
In voices calm and measured, old.
```

31.
```text
Calimshan candles gutter low,
But no one rushes from the room,
Feast of the Moon prefers it so,
That time itself should gently bloom.
```

32.
```text
In Tethyr roads lie calm and bare,
No caravan disturbs the night,
Feast of the Moon draws circles there,
Where family holds the truest right.
```

33.
```text
At Baldur's Gate the harbor rests,
The ships like shadows tied to shore,
Feast of the Moon counts quiet guests,
Who need no tally anymore.
```

34.
```text
In Saltmarsh nets are folded clean,
And left until another day,
Feast of the Moon walks between,
What must be done and what can stay.
```

35.
```text
A final candle guttering low,
The table cleared but hearts still full,
Feast of the Moon lets go,
And leaves behind what's beautiful.
```

36.
```text
The candles burn, the room grows still,
As names are spoken soft and true,
Feast of the Moon bends time and will,
To keep the bonds we once all knew.
```

##### `quips.festival.feastofthemoon.short` (47 entries)

1.
```text
Moonlight warms the Waterdeep table,
Feast of the Moon keeps kinship able.
```

2.
```text
Amnian homes grow close and kind,
Feast of the Moon feeds heart and mind.
```

3.
```text
Calimshan candles burn down low,
Feast of the Moon lets memories glow.
```

4.
```text
Tethyr's halls hold quieter cheer,
Feast of the Moon draws loved ones near.
```

5.
```text
At Baldur's Gate the streets go calm,
Feast of the Moon is gentle balm.
```

6.
```text
Saltmarsh shares a simple meal,
Feast of the Moon makes bonds real.
```

7.
```text
A place is set for those not here,
Feast of the Moon keeps names sincere.
```

8.
```text
Stories pass with bread and wine,
Feast of the Moon redraws the line.
```

9.
```text
Moonlight pools on window sill,
Feast of the Moon asks hearts be still.
```

10.
```text
Hands are held, no bargains struck,
Feast of the Moon counts quiet luck.
```

11.
```text
Amn forgives the year's sharp turn,
Feast of the Moon lets old wounds burn.
```

12.
```text
Calishite tea grows sweet and slow,
Feast of the Moon lets children know.
```

13.
```text
Tethyr's banners hang at rest,
Feast of the Moon prefers the chest.
```

14.
```text
At Baldur's Gate the harbor sighs,
Feast of the Moon lifts weary eyes.
```

15.
```text
Saltmarsh nets are left alone,
Feast of the Moon comes home to home.
```

16.
```text
A candle marks the absent seat,
Feast of the Moon makes loss complete.
```

17.
```text
Songs are soft and laughter brief,
Feast of the Moon respects the grief.
```

18.
```text
Moon climbs high, the table stays,
Feast of the Moon outlasts the days.
```

19.
```text
Amnian bread is broken slow,
Feast of the Moon lets patience grow.
```

20.
```text
Calimshan incense curls like thread,
Feast of the Moon names all the dead.
```

21.
```text
Tethyr's fire burns low and clear,
Feast of the Moon keeps memory near.
```

22.
```text
At Baldur's Gate the bells don't ring,
Feast of the Moon needs quieter things.
```

23.
```text
Saltmarsh children hear old tales,
Feast of the Moon sets gentler sails.
```

24.
```text
A toast is raised without a cheer,
Feast of the Moon keeps voices clear.
```

25.
```text
Moonlight silver on the floor,
Feast of the Moon asks nothing more.
```

26.
```text
Amn closes shop before the dark,
Feast of the Moon leaves its mark.
```

27.
```text
Calimshan streets grow hushed and deep,
Feast of the Moon lets secrets sleep.
```

28.
```text
Tethyr's roads lie calm and bare,
Feast of the Moon draws circles there.
```

29.
```text
At Baldur's Gate the tide runs slow,
Feast of the Moon lets feelings flow.
```

30.
```text
Saltmarsh smoke drifts thin and pale,
Feast of the Moon tells every tale.
```

31.
```text
A chair stays empty by design,
Feast of the Moon keeps the line.
```

32.
```text
Hands pass dishes, not the blame,
Feast of the Moon forgives the same.
```

33.
```text
Amnian elders nod and smile,
Feast of the Moon is worth the while.
```

34.
```text
Calimshan moons are bright and kind,
Feast of the Moon clears the mind.
```

35.
```text
Tethyr's watch walks softer still,
Feast of the Moon bends iron will.
```

36.
```text
At Baldur's Gate the lamps burn low,
Feast of the Moon lets the past show.
```

37.
```text
Saltmarsh listens to the sea,
Feast of the Moon lets it be.
```

38.
```text
A prayer said without reply,
Feast of the Moon lets questions lie.
```

39.
```text
Moon climbs high, the night stays warm,
Feast of the Moon keeps the form.
```

40.
```text
Amn sets bread for guests unseen,
Feast of the Moon walks between.
```

41.
```text
Calimshan names the years gone by,
Feast of the Moon hears every sigh.
```

42.
```text
Tethyr's hearthstones glow like gold,
Feast of the Moon guards old and old.
```

43.
```text
At Baldur's Gate the crowd stays near,
Feast of the Moon holds those dear.
```

44.
```text
Saltmarsh eats before the fire,
Feast of the Moon lifts desire.
```

45.
```text
A final candle guttering low,
Feast of the Moon lets go.
```

46.
```text
Moonlight fades at breaking day,
Feast of the Moon gently stays.
```

47.
```text
Moonlit tables hold what we keep,
Feast of the Moon runs deep.
```

#### `greengrass`

##### `quips.festival.greengrass.long` (19 entries)

1.
```text
On Waterdeep's streets the gutters run,
With rain that smells of open ground,
Greengrass begins the work begun,
And lifts the year with gentler sound,
Fresh paint dries on a guildhall wall,
A bright new mark against the gray,
The past still stands, but does not call,
As hands turn forward, day by day.
```

2.
```text
In Amn the ledgers close at noon,
While seeds are blessed in temple shade,
Greengrass hums a planting tune,
And trades the pen for spade,
A farmer bows before the furrow,
Then breaks the soil with patient care,
The risk is named, the hope is borrowed,
And rain is trusted to be fair.
```

3.
```text
In Calimshan the courtyards fill,
With green-dyed cloth and bare-soled feet,
Greengrass teaches heat to will,
A kinder, less exhausting beat,
Incense mixes with new-cut grass,
As dancers spin beneath the sun,
The old year loosens, lets it pass,
And leaves the growing work begun.
```

4.
```text
In Tethyr fields the iron rings,
As plow and stone make honest rhyme,
Greengrass weighs the cost of things,
Then spends it all on growing time,
Fences mended, hands still sore,
The land is trusted once again,
What winter took and would not store,
Is paid back slow in sun and rain.
```

5.
```text
At Baldur's Gate the docks smell rain,
The river swells with brighter sheen,
Greengrass rinses loss and gain,
And paints the hulls in hopeful green,
A captain swears to honest weight,
And lowers tolls for one full day,
The city learns to celebrate,
By letting fairness lead the way.
```

6.
```text
In Saltmarsh marsh the frogs begin,
Their chorus low, then growing bold,
Greengrass lets the noise step in,
Where winter kept the waters cold,
Boats are scrubbed and nets are mended,
With wreaths of reed and river twine,
The season turns, the work is ended,
Then started fresh by quiet sign.
```

7.
```text
A bell rings once for planting day,
Then waits to hear the answer sound,
Greengrass shows the simple way,
To trust the hand that breaks the ground,
No oath is sworn in gilded hall,
No crown is raised above the field,
The promise comes when seeds are small,
And hope is all the land can yield.
```

8.
```text
New bread is cut on Waterdeep stone,
And shared with those who pass nearby,
Greengrass proves the seed is sown,
Where food and fellowship comply,
A child drops crumbs for birds to claim,
And laughs as wings beat close and fast,
The future does not need a name,
When shared enough to truly last.
```

9.
```text
Calimshan markets bloom with sound,
Of spice and cloth and honest cheer,
Greengrass turns the wheel around,
And makes the coming season clear,
Coins are light, but laughter strong,
As shade and sun trade place and play,
The year relearns its older song,
And sings it slow, but sings to stay.
```

10.
```text
Tethyr's creeks run fast and clean,
They cut the fields with silver line,
Greengrass keeps the promise green,
By letting water choose its sign,
Children race the rising flow,
And mark the banks with muddy feet,
The land remembers how to grow,
By letting risk and joy both meet.
```

11.
```text
At Baldur's Gate the fog lifts slow,
Revealing masts like waiting spears,
Greengrass lets the harbor show,
What winter hid with colder fears,
A toast is poured for ships to come,
And one for those that did not return,
The year moves on, the sum is sum,
And hope is earned by those who learn.
```

12.
```text
Saltmarsh children plant a tree,
In earth still soft with morning rain,
Greengrass trusts what yet will be,
And pays the work with hope, not gain,
No banner marks the humble rite,
No crown is placed on any brow,
The future grows in common sight,
From hands that plant the promise now.
```

13.
```text
On Waterdeep's damp cobbled lane,
A child draws suns in dripping chalk,
Greengrass turns the rain to gain,
And teaches joy to learn to walk,
The picture fades before it dries,
Yet leaves a mark on watching eyes,
The year does not need proofs or ties,
When hope appears in simple guise.
```

14.
```text
In Amn the poor receive their share,
Of seed and bread and early rain,
Greengrass makes the balance fair,
By counting hands instead of coin,
A guildmaster loosens careful rules,
And lets the wagons roll out free,
The city learns the gentler tools,
That bind a people better than fee.
```

15.
```text
Calimshan nights grow warm and sweet,
The stars feel closer than before,
Greengrass pulls the sky to street,
And leaves it there to promise more,
Poets trade their desert fire,
For verses green with growing things,
The year adjusts its old desire,
And listens when the future sings.
```

16.
```text
Tethyr's banners lift and stir,
As wind smells fresh of open ground,
Greengrass makes the future sure,
By giving hope a working sound,
No blade is drawn, no oath is sworn,
But soil is turned and fences set,
The year is claimed by what is born,
Not by the debts we won't forget.
```

17.
```text
At Baldur's Gate the river laughs,
And slaps the stone with rising cheer,
Greengrass counts the hopeful crafts,
That build the coming trading year,
Hands that haul and hands that write,
Meet at last on common ground,
The season sets the terms just right,
Where shared reward is what is found.
```

18.
```text
Saltmarsh marsh turns gold and green,
As reeds forget the frost they knew,
Greengrass blesses what's between,
The land, the sea, and those who do,
A fisher sets a bowl aside,
For tides that gave and took before,
The year moves on, the work abides,
And hope is tied to shore and oar.
```

19.
```text
A final frost melts off the rail,
And drips like coin into the street,
Greengrass lets the winter fail,
And hands the year to warmer feet,
No shout is raised, no trumpet blown,
The change arrives by quiet sign,
The future grows where seeds are sown,
And time agrees to take its time.
```

##### `quips.festival.greengrass.medium` (42 entries)

1.
```text
On Waterdeep's streets the gutters run,
With rain that smells of open ground,
Greengrass begins the work begun,
And lifts the year with gentler sound.
```

2.
```text
In Amn the ledgers close at noon,
While seeds are blessed in temple shade,
Greengrass hums a planting tune,
And trades the pen for spade.
```

3.
```text
In Calimshan the courtyards fill,
With green-dyed cloth and bare-soled feet,
Greengrass teaches heat to will,
A kinder, less exhausting beat.
```

4.
```text
In Tethyr fields the iron rings,
As plow and stone make honest rhyme,
Greengrass weighs the cost of things,
Then spends it all on growing time.
```

5.
```text
At Baldur's Gate the docks smell rain,
The river swells with brighter sheen,
Greengrass rinses loss and gain,
And paints the hulls in hopeful green.
```

6.
```text
In Saltmarsh marsh the frogs begin,
Their chorus low, then growing bold,
Greengrass lets the noise step in,
Where winter kept the waters cold.
```

7.
```text
A bell rings once for planting day,
Then waits to hear the answer sound,
Greengrass shows the simple way,
To trust the hand that breaks the ground.
```

8.
```text
New bread is cut on Waterdeep stone,
And shared with those who pass nearby,
Greengrass proves the seed is sown,
Where food and fellowship comply.
```

9.
```text
In Amn a farmer bows his head,
Before the furrow meets the rain,
Greengrass counts the words unsaid,
And blesses risk instead of gain.
```

10.
```text
Calishite dancers spin in green,
Their anklets tapping warmed-up tiles,
Greengrass wakes what slept unseen,
And trades the weeks for miles of smiles.
```

11.
```text
Tethyr's roads grow loud with carts,
That carry grain and eager hands,
Greengrass mends the broken parts,
Between the towns and scattered lands.
```

12.
```text
At Baldur's Gate a captain swears,
To fairer weights and honest tolls,
Greengrass likes the vow that dares,
To plant its trust in working souls.
```

13.
```text
In Saltmarsh boats are scrubbed and blessed,
With salt and wreaths of river reed,
Greengrass tests what winter stressed,
Then lets the tide decide the speed.
```

14.
```text
A priest speaks soil, not sin or shame,
As rain taps soft on temple stone,
Greengrass gives the rite its name,
By letting work and faith be one.
```

15.
```text
On Waterdeep's wall fresh paint dries,
A sigil bright against the gray,
Greengrass lets the city try,
A newer face without delay.
```

16.
```text
In Amn the caravaners rest,
And oil the wheels with patient care,
Greengrass teaches what is best,
Is fixing now before you dare.
```

17.
```text
Calimshan's markets bloom with sound,
Of spice and cloth and honest cheer,
Greengrass turns the wheel around,
And makes the coming season clear.
```

18.
```text
In Tethyr creeks run fast and clean,
They cut the fields with silver line,
Greengrass keeps the promise green,
By letting water choose its sign.
```

19.
```text
At Baldur's Gate the fog lifts slow,
Revealing masts like waiting spears,
Greengrass lets the harbor show,
What winter hid with colder fears.
```

20.
```text
Saltmarsh children plant a tree,
In earth still soft with morning rain,
Greengrass trusts what yet will be,
And pays the work with hope, not gain.
```

21.
```text
A wreath of wheat on every door,
A sprig of pine laid on the sill,
Greengrass asks the earth once more,
To teach the hands to hold it still.
```

22.
```text
Waterdeep's bells ring clear and bright,
But stop before the echo fades,
Greengrass keeps the tone just right,
Between the noise and quiet trades.
```

23.
```text
In Amn the poor receive their share,
Of seed and bread and early rain,
Greengrass makes the balance fair,
By counting hands instead of coin.
```

24.
```text
Calimshan nights grow warm and sweet,
The stars feel closer than before,
Greengrass pulls the sky to street,
And leaves it there to promise more.
```

25.
```text
Tethyr's farms ring iron-true,
As fences mended face the sun,
Greengrass shows the work to do,
Is never ended-just begun.
```

26.
```text
At Baldur's Gate a toast is poured,
To ships that soon will ride the swell,
Greengrass favors what's restored,
And trusts the tides that know us well.
```

27.
```text
Saltmarsh smoke turns pale and thin,
As nets dry out along the quay,
Greengrass lets the light step in,
And sets the future out to sea.
```

28.
```text
A charm of green is tied with twine,
Above the hearth or stable beam,
Greengrass draws the gentler line,
Between the hope and reckless dream.
```

29.
```text
On Waterdeep's damp cobbled lane,
A child draws suns in dripping chalk,
Greengrass turns the rain to gain,
And teaches joy to learn to walk.
```

30.
```text
In Amn the ink stays dry all day,
While soil is turned by every hand,
Greengrass likes it best this way,
When books can wait and fields command.
```

31.
```text
Calimshan poets trade their themes,
From desert fire to growing green,
Greengrass loosens older dreams,
And writes new ones in what is seen.
```

32.
```text
Tethyr's banners lift and stir,
As wind smells fresh of open ground,
Greengrass makes the future sure,
By giving hope a working sound.
```

33.
```text
At Baldur's Gate the river laughs,
And slaps the stone with rising cheer,
Greengrass counts the hopeful crafts,
That build the coming trading year.
```

34.
```text
Saltmarsh marsh turns gold and green,
As reeds forget the frost they knew,
Greengrass blesses what's between,
The land, the sea, and those who do.
```

35.
```text
A final frost melts off the rail,
And drips like coin into the street,
Greengrass lets the winter fail,
And hands the year to warmer feet.
```

36.
```text
On Waterdeep's long market row,
New stalls appear like sprouting leaves,
Greengrass proves the old is slow,
To leave when hope still half-believes.
```

37.
```text
In Amn a farmer laughs aloud,
As rain soaks deep the waiting field,
Greengrass makes the poor feel proud,
Of risks the patient heart must yield.
```

38.
```text
Calimshan's gates stand open wide,
No shade pulled tight against the sun,
Greengrass sets the heat aside,
And says the gentler work's begun.
```

39.
```text
Tethyr's children race the plow,
Leaving footprints in the loam,
Greengrass does not ask them how,
It lets the future call that home.
```

40.
```text
At Baldur's Gate the bells ring once,
For seed and sail and honest toil,
Greengrass spends its small advance,
On hands that trust the waiting soil.
```

41.
```text
Saltmarsh elders nod and smile,
At boats newly tarred and keen,
Greengrass knows the worth of trial,
And paints it hopeful, bright, and green.
```

42.
```text
A seed in hand, a vow in chest,
A furrow cut with patient art,
Greengrass asks the earth the rest,
And plants the future in the heart.
```

##### `quips.festival.greengrass.short` (47 entries)

1.
```text
Fresh shoots break through Waterdeep stone,
Greengrass says the year has grown.
```

2.
```text
Amnian ledgers pause their ink,
Greengrass gives the fields a drink.
```

3.
```text
Calimshan scents the air with green,
Greengrass wakes what slept unseen.
```

4.
```text
Tethyrian plows cut earth and loam,
Greengrass turns the soil to home.
```

5.
```text
At Baldur's Gate the docks smell rain,
Greengrass rinses loss and gain.
```

6.
```text
Saltmarsh marshes breathe anew,
Greengrass paints the reeds in blue.
```

7.
```text
A wreath is hung on every door,
Greengrass asks for hope, not more.
```

8.
```text
Seeds are blessed in temple light,
Greengrass starts the long road right.
```

9.
```text
Children chalk new suns in squares,
Greengrass trades in hopeful dares.
```

10.
```text
Rain taps bells with gentle sound,
Greengrass wakes the sleeping ground.
```

11.
```text
Amn forgives a winter debt,
Greengrass likes the books reset.
```

12.
```text
Calishite dancers bare their feet,
Greengrass finds the stones still sweet.
```

13.
```text
Tethyr's banners lift and stir,
Greengrass makes them whisper, "Start."
```

14.
```text
At Baldur's Gate the nets go free,
Greengrass trusts the open sea.
```

15.
```text
Saltmarsh boats are scrubbed and blessed,
Greengrass tests what winter stressed.
```

16.
```text
A priest speaks soil, not sin,
Greengrass lets the work begin.
```

17.
```text
New bread breaks with older hands,
Greengrass joins the scattered lands.
```

18.
```text
A bell rings once for planting time,
Greengrass loves a simple chime.
```

19.
```text
Green ribbons tie the market stalls,
Greengrass hears the future calls.
```

20.
```text
Rain and sun trade place and play,
Greengrass teaches how to stay.
```

21.
```text
Amnian fields turn dark and kind,
Greengrass pays the patient mind.
```

22.
```text
Calimshan courts throw doors out wide,
Greengrass sets the shade aside.
```

23.
```text
Tethyr's roads grow busy feet,
Greengrass makes the journey meet.
```

24.
```text
At Baldur's Gate a toast is poured,
Greengrass favors what's restored.
```

25.
```text
Saltmarsh kids chase frogs and cheer,
Greengrass says the year is here.
```

26.
```text
A wreath of wheat, a sprig of pine,
Greengrass draws the gentler line.
```

27.
```text
Coins are light, but laughter strong,
Greengrass rights the winter wrong.
```

28.
```text
Fresh paint marks a guildhall wall,
Greengrass likes beginnings small.
```

29.
```text
A song is taught, then taught again,
Greengrass plants it deep in men.
```

30.
```text
Amn counts rain instead of gold,
Greengrass breaks the winter hold.
```

31.
```text
Calim's nights grow warm and sweet,
Greengrass pulls the stars down street.
```

32.
```text
Tethyr's farms ring iron true,
Greengrass keeps the promise new.
```

33.
```text
At Baldur's Gate the river swells,
Greengrass listens when it tells.
```

34.
```text
Saltmarsh smoke turns pale and thin,
Greengrass lets the light step in.
```

35.
```text
A charm is tied with greenest thread,
Greengrass lifts the year ahead.
```

36.
```text
New vows spoken, old ones kept,
Greengrass knows what winter slept.
```

37.
```text
A bellrope smells of rain and hemp,
Greengrass pays the season's rent.
```

38.
```text
Seeds pressed deep in shared-up rows,
Greengrass trusts what no one knows.
```

39.
```text
Amnian caravans roll free,
Greengrass clears the road to be.
```

40.
```text
Calimshan markets bloom with sound,
Greengrass spins the wheel around.
```

41.
```text
Tethyr's creeks run fast and clear,
Greengrass whispers, "Plant it here."
```

42.
```text
At Baldur's Gate the fog lifts slow,
Greengrass lets the harbor show.
```

43.
```text
Saltmarsh marsh turns gold and green,
Greengrass blesses what's between.
```

44.
```text
A final frost, a final sigh,
Greengrass lifts the winter sky.
```

45.
```text
Children plant a tree in square,
Greengrass puts the future there.
```

46.
```text
A seed in hand, a vow in chest,
Greengrass asks the earth the rest.
```

47.
```text
Rain stops just as bells begin,
Greengrass says, "Now enter in."
```

#### `highharvestide`

##### `quips.festival.highharvestide.long` (15 entries)

1.
```text
On Waterdeep's square the grain stands tall,
Measured twice, then shared with care,
Highharvestide answers the call,
To count the yield and make it fair,
The scales are wiped, the ledgers read,
In open air beneath the sun,
The city learns it's safely fed,
By many hands that worked as one.
```

2.
```text
In Amn the ledgers close at dusk,
The ink dries dark, the margins clean,
Highharvestide lifts the husk,
From numbers earned and numbers seen,
A portion's set for winter lean,
Another freed for those in need,
The balance holds because it's keen,
To count the heart as well as deed.
```

3.
```text
In Calimshan the spices blend,
Sweet and sharp in amber light,
Highharvestide lets the feast end,
With thanks that balance appetite,
No drum drowns out the final count,
No song ignores the measured sum,
The season rests when both amount,
And labor knows the work is done.
```

4.
```text
In Tethyr barns the doors are sealed,
The last cart gone before the frost,
Highharvestide weighs what fields revealed,
And names the gain beside the cost,
The soil rests after honest strain,
The farmers rest with aching hands,
The year is judged by sun and rain,
And held secure in wooden bands.
```

5.
```text
At Baldur's Gate the docks smell bread,
And wine is poured in steady flow,
Highharvestide feeds the fed,
And counts the ships that didn't go,
A toast is raised to work well done,
Not risk, nor chance, nor daring play,
The harbor sleeps because it's won,
Enough to face the colder day.
```

6.
```text
In Saltmarsh nets lie heavy still,
With fish enough for trade and store,
Highharvestide tests the will,
To save for need, not spend for more,
A share is set for storms to come,
Another sold to settle debt,
The sea is thanked for what was won,
And for what patience hasn't met.
```

7.
```text
A ledger read in open sound,
Then closed with nods, not cheers or jeers,
Highharvestide keeps the meaning bound,
To honest work across the years,
No seal is pressed behind a door,
No clause is left to hidden ink,
The numbers stand because they're sure,
And all can see, and all can think.
```

8.
```text
On Waterdeep's long market row,
The stalls stand quiet after noon,
Highharvestide lets the balance show,
Before the winter comes too soon,
The last crate marked, the last scale set,
The crowd disperses fed and calm,
The city keeps the promise met,
Like a remembered harvest psalm.
```

9.
```text
In Amn the caravans roll slow,
Heavy with goods and settled books,
Highharvestide lets the totals show,
Before the snows reclaim the routes,
The road is trusted one more time,
The profit weighed against the strain,
The year concludes its careful climb,
And pauses, counted, not in vain.
```

10.
```text
Calimshan feasts run long but calm,
The drums subdued, the talk precise,
Highharvestide finds its psalm,
In measured thanks, not heedless vice,
The lamps burn low, the tables clear,
The spice is packed, the doors are shut,
The season ends in honest cheer,
And sleeps beside the earned-up glut.
```

11.
```text
In Tethyr the farmers rest at last,
Their hands still sore, their barns secure,
Highharvestide weighs future past,
And names what risk the land can endure,
The plow is hung, the field lies bare,
The seed is saved for colder ground,
The year is closed with steady care,
And hope is stored, not scattered round.
```

12.
```text
At Baldur's Gate the bells ring low,
As trade winds turn toward colder seas,
Highharvestide lets us know,
What must be saved and what to please,
The river flows indifferent still,
Yet mirrors lamps and counting eyes,
The city learns the quiet skill,
Of knowing when to economize.
```

13.
```text
In Saltmarsh smoke drifts pale and thin,
As fish are dried for winter keep,
Highharvestide settles in,
Where patience learns to harvest sleep,
The boats sit low, the tide runs slack,
The work is done, the ledgers fair,
The year looks forward, not back,
Because the stores are truly there.
```

14.
```text
A cup is shared, a tally done,
Before the tables clear away,
Highharvestide names who won,
By keeping hunger far at bay,
No crown is placed, no prize is shown,
The victory is plainly fed,
The town stands full, the work is known,
And winter waits outside, well-read.
```

15.
```text
The year is weighed in grain and care,
In hands that worked and fields that fed,
Highharvestide asks us to share,
The truth of all the sums we read,
No excess cheers, no hungry plea,
The balance struck by honest art,
The season ends responsibly,
With food enough and lighter heart.
```

##### `quips.festival.highharvestide.medium` (36 entries)

1.
```text
On Waterdeep's square the grain stands tall,
Measured twice, then shared with care,
Highharvestide answers the call,
To count the yield and make it fair.
```

2.
```text
In Amn the ledgers close at dusk,
The ink dries dark, the margins clean,
Highharvestide lifts the husk,
From numbers earned and numbers seen.
```

3.
```text
In Calimshan the spices blend,
Sweet and sharp in amber light,
Highharvestide lets the feast end,
With thanks that balance appetite.
```

4.
```text
In Tethyr barns the doors are sealed,
The last cart gone before the frost,
Highharvestide weighs what fields revealed,
And names the gain beside the cost.
```

5.
```text
At Baldur's Gate the docks smell bread,
And wine is poured in steady flow,
Highharvestide feeds the fed,
And counts the ships that didn't go.
```

6.
```text
In Saltmarsh nets lie heavy still,
With fish enough for trade and store,
Highharvestide tests the will,
To save for need, not spend for more.
```

7.
```text
A ledger read in open sound,
Then closed with nods, not cheers or jeers,
Highharvestide keeps the meaning bound,
To honest work across the years.
```

8.
```text
On Waterdeep's long market row,
The stalls stand quiet after noon,
Highharvestide lets the balance show,
Before the winter comes too soon.
```

9.
```text
In Amn a portion's set aside,
For leaner months and poorer hands,
Highharvestide judges pride,
By how well mercy understands.
```

10.
```text
Calimshan's lamps glow amber-bright,
As merchants share a final count,
Highharvestide weighs day and night,
And names the sum that should amount.
```

11.
```text
In Tethyr fields lie cut and bare,
The soil rests after honest strain,
Highharvestide knows what was there,
And trusts the seed will come again.
```

12.
```text
At Baldur's Gate a toast is raised,
Not to risk, but work well done,
Highharvestide quietly praised,
The many hands that fed the one.
```

13.
```text
In Saltmarsh elders nod and smile,
As barrels line the curing shed,
Highharvestide makes the while,
Worth every hour the fishers bled.
```

14.
```text
A tithe is set, a portion free,
Before the winter locks the road,
Highharvestide guards equity,
And lightens each shared load.
```

15.
```text
On Waterdeep's stone counting floor,
The final tally's read aloud,
Highharvestide proves the law is more,
Than hoarded wealth or voices loud.
```

16.
```text
In Amn the caravans roll slow,
Heavy with goods and settled books,
Highharvestide lets the totals show,
Before the snows reclaim the routes.
```

17.
```text
Calimshan feasts run long but calm,
The drums subdued, the talk precise,
Highharvestide finds its psalm,
In measured thanks, not heedless vice.
```

18.
```text
In Tethyr the farmers rest at last,
Their hands still sore, their barns secure,
Highharvestide weighs future past,
And names what risk the land can endure.
```

19.
```text
At Baldur's Gate the bells ring low,
As trade winds turn toward colder seas,
Highharvestide lets us know,
What must be saved and what to please.
```

20.
```text
In Saltmarsh smoke drifts pale and thin,
As fish are dried for winter keep,
Highharvestide settles in,
Where patience learns to harvest sleep.
```

21.
```text
A cup is shared, a tally done,
Before the tables clear away,
Highharvestide names who won,
By keeping hunger far at bay.
```

22.
```text
On Waterdeep's docks at fading light,
The last crate's marked and set aside,
Highharvestide gets the numbers right,
Before the tides and tempests hide.
```

23.
```text
In Amn a smile meets balanced page,
No surplus wild, no deficit deep,
Highharvestide closes the age,
And promises the books will keep.
```

24.
```text
Calimshan counts both scent and sound,
The feast, the work, the careful art,
Highharvestide marks the round,
Where profit meets the human heart.
```

25.
```text
In Tethyr barns the lamps burn low,
As seals are pressed and doors are barred,
Highharvestide lets the farmers know,
Their labor stands as winter's guard.
```

26.
```text
At Baldur's Gate the crowd eats well,
From tables set with honest share,
Highharvestide has much to tell,
About the virtue of repair.
```

27.
```text
In Saltmarsh a share is set apart,
For storms that steal the coming year,
Highharvestide teaches the heart,
To value calm as much as cheer.
```

28.
```text
Gratitude walks from stall to stall,
And lingers after trade is done,
Highharvestide hears every call,
And answers not with excess, but one.
```

29.
```text
On Waterdeep's broad counting steps,
The crowd disperses, fed and calm,
Highharvestide quietly keeps,
Its blessing like a closing psalm.
```

30.
```text
In Amn the scales are wiped and true,
No trick allowed at season's end,
Highharvestide begins anew,
Where fairness is the coin we spend.
```

31.
```text
Calimshan merchants close their doors,
And sleep beside the counted gain,
Highharvestide asks nothing more,
Than rest before the winter rain.
```

32.
```text
In Tethyr thanks are said by name,
To soil, to rain, to calloused hand,
Highharvestide honors pain,
As part of how the fields still stand.
```

33.
```text
At Baldur's Gate the river flows,
Unmoved by sums or settled books,
Highharvestide leaves us those,
Who learn from water more than looks.
```

34.
```text
In Saltmarsh nets are stacked and dry,
The last boat hauled before the frost,
Highharvestide lets the tally lie,
Beside the memory of cost.
```

35.
```text
A final toast before the cold,
No shout, no boast, no hungry plea,
Highharvestide weighs the gold,
Against the needs of community.
```

36.
```text
The harvest's counted, debts are clear,
The tables set, the barns secured,
Highharvestide ends the year,
With thanks that keep the future sure.
```

##### `quips.festival.highharvestide.short` (48 entries)

1.
```text
Grain piled high in Waterdeep square,
Highharvestide counts what we share.
```

2.
```text
Amnian ledgers close with cheer,
Highharvestide ends the year.
```

3.
```text
Calimshan spices sweet the air,
Highharvestide shows wealth with care.
```

4.
```text
Tethyr's barns stand full and bright,
Highharvestide weighs the yield right.
```

5.
```text
At Baldur's Gate the casks run deep,
Highharvestide keeps what we reap.
```

6.
```text
Saltmarsh nets come heavy in,
Highharvestide pays the sea's long sin.
```

7.
```text
Loaves are stacked in even rows,
Highharvestide lets the balance show.
```

8.
```text
Thanks are spoken, debts are named,
Highharvestide keeps pride tamed.
```

9.
```text
A cup is raised, a scale reset,
Highharvestide counts every debt.
```

10.
```text
Markets hum in golden light,
Highharvestide gets the numbers right.
```

11.
```text
Amn forgives the lean-year due,
Highharvestide starts accounts anew.
```

12.
```text
Calishite feasts run slow and long,
Highharvestide hums a measured song.
```

13.
```text
Tethyr's fields lie cut and bare,
Highharvestide knows what was there.
```

14.
```text
At Baldur's Gate the wine is poured,
Highharvestide honors stored.
```

15.
```text
Saltmarsh smoke smells fish and grain,
Highharvestide rewards the strain.
```

16.
```text
Scales are wiped and set aside,
Highharvestide trusts what was tried.
```

17.
```text
Gratitude walks stall to stall,
Highharvestide hears every call.
```

18.
```text
A final count before the frost,
Highharvestide names the cost.
```

19.
```text
Coins ring soft, not sharp with need,
Highharvestide knows the deed.
```

20.
```text
Amnian caravans roll slow,
Highharvestide lets the totals show.
```

21.
```text
Calimshan lamps glow amber-bright,
Highharvestide ends the night.
```

22.
```text
Tethyr's banners dip in thanks,
Highharvestide closes ranks.
```

23.
```text
At Baldur's Gate the docks smell bread,
Highharvestide feeds the fed.
```

24.
```text
Saltmarsh boats sit low and full,
Highharvestide judges fair pull.
```

25.
```text
A tithe is set, a portion free,
Highharvestide guards equity.
```

26.
```text
Fields lie quiet, work complete,
Highharvestide counts the beat.
```

27.
```text
Markets close, then open wide,
Highharvestide trusts the tide.
```

28.
```text
Amn writes gains in careful hand,
Highharvestide steadies land.
```

29.
```text
Calimshan weighs spice and gold,
Highharvestide favors told.
```

30.
```text
Tethyr's farmers rest at last,
Highharvestide weighs future past.
```

31.
```text
At Baldur's Gate the crowd eats well,
Highharvestide has much to tell.
```

32.
```text
Saltmarsh elders nod and smile,
Highharvestide's worth the while.
```

33.
```text
A ledger closed, a table spread,
Highharvestide feeds the head.
```

34.
```text
Thanks are due and paid in kind,
Highharvestide clears the mind.
```

35.
```text
Amn sets aside a winter store,
Highharvestide plans for more.
```

36.
```text
Calimshan's markets slow their pace,
Highharvestide keeps the place.
```

37.
```text
Tethyr's barns are sealed and blessed,
Highharvestide grants the rest.
```

38.
```text
At Baldur's Gate the bells ring low,
Highharvestide lets us know.
```

39.
```text
Saltmarsh smoke drifts calm and thin,
Highharvestide settles in.
```

40.
```text
A cup shared late, a tally done,
Highharvestide names who won.
```

41.
```text
The year gives back what hands have sown,
Highharvestide makes it known.
```

42.
```text
Amn smiles at a balanced page,
Highharvestide closes the age.
```

43.
```text
Calimshan counts the scent and sound,
Highharvestide marks the round.
```

44.
```text
Tethyr thanks both soil and rain,
Highharvestide honors pain.
```

45.
```text
At Baldur's Gate the tables groan,
Highharvestide feeds unknown.
```

46.
```text
Saltmarsh sets aside a share,
Highharvestide keeps it fair.
```

47.
```text
A final toast before the cold,
Highharvestide weighs the gold.
```

48.
```text
Full barns, full hearts before the cold,
Highharvestide keeps what we hold.
```

#### `midsummer`

##### `quips.festival.midsummer.long` (20 entries)

1.
```text
On Waterdeep's streets the torches burn,
And shadows leap from stone to stone,
Midsummer makes the city turn,
And claim the night as fully grown,
The watch forgets the measured hour,
As bells ring wild without a rule,
The longest day asserts its power,
And crowns excess as beautiful.
```

2.
```text
In Amn the ledgers close their eyes,
While dice and cups replace the pen,
Midsummer teaches how the wise,
Can lose themselves and still be men,
A merchant spills his wine and laughs,
At stains that fade by break of day,
The year forgives these brief halves,
Of order joyfully thrown away.
```

3.
```text
In Calimshan the courtyards roar,
With drums that race the beating heart,
Midsummer throws the doors wide open,
And calls restraint a timid art,
Incense mixes with sweat and flame,
As dancers spin till dawn is near,
The night forgets its borrowed name,
And lives entirely in the here.
```

4.
```text
In Tethyr fields the bonfires rise,
Their sparks like stars against the dark,
Midsummer writes across the skies,
A promise fierce and hard to mark,
Knights and farmers share one ring,
Their boots strike time on beaten loam,
The fire teaches everything,
About the cost of calling home.
```

5.
```text
At Baldur's Gate the river shines,
With lanterns drifting, slow and bright,
Midsummer blurs the careful lines,
Between the day and deeper night,
A captain swears no oath this eve,
But drinks and sings with deck and dock,
The city learns what to believe,
When rules are set aside by clock.
```

6.
```text
In Saltmarsh fires line the shore,
And sailors dance on cooling sand,
Midsummer asks for nothing more,
Than letting go by joined-up hand,
Ash drifts soft across the tide,
Like memory that will not stay,
The sea accepts what we provide,
Then carries all the rest away.
```

7.
```text
A wreath is passed from head to head,
Till laughter crowns the poorest soul,
Midsummer leaves no wish unsaid,
And makes excess a rightful goal,
The night stretches like open road,
Where every song may find its end,
The year forgets its careful load,
And trusts the joy it cannot mend.
```

8.
```text
On Waterdeep's wall the watch looks down,
Yet joins the song they swore to keep,
Midsummer pulls the city crown,
And lets it laugh instead of sleep,
The bells ring out beyond their count,
Till meaning blurs to sound alone,
The night climbs every guarded mount,
And claims the city as its own.
```

9.
```text
In Amn a toast is raised too high,
And spilled with laughter on the stone,
Midsummer teaches how to try,
To lose control and not be lone,
The stain will fade, the coin be found,
The order will return in time,
But joy leaves marks upon the ground,
That prove the year can still outclimb.
```

10.
```text
Calimshan markets bloom with sound,
Of flute and drum and reckless cheer,
Midsummer turns the wheel around,
And makes the coming season clear,
No shade is drawn against the heat,
No voice is asked to hold its place,
The night accepts no small retreat,
And leaves delight upon each face.
```

11.
```text
Tethyr's banners glow like flame,
As wind snaps cloth against the sky,
Midsummer burns away the same,
Old oaths that feared to ask us why,
The fire rings wide, then wider still,
Till every border melts away,
The night instructs the human will,
In how to spend, not hoard, the day.
```

12.
```text
At Baldur's Gate the bells go mad,
Then lose the count of why they rang,
Midsummer keeps the joy we had,
Long after careful rules have sang,
The dawn arrives with gentle scold,
And finds the city tired and free,
The year resumes its measured hold,
But keeps the memory quietly.
```

13.
```text
In Saltmarsh dawn arrives too soon,
With ash and smiles along the quay,
Midsummer fades beneath the moon,
But leaves the taste of being free,
The boats rock soft against the tide,
Still humming tunes the night once knew,
The sea keeps secrets we confide,
And gives them back as something new.
```

14.
```text
Lantern smoke and laughter rise,
Till stars feel close as outstretched hands,
Midsummer draws the distant skies,
Into the streets and common lands,
The longest night refuses end,
Until the body cannot stay,
The year forgives the strength we spend,
And asks us nothing more than play.
```

15.
```text
On Waterdeep's broad avenue,
The music drowns the city's cares,
Midsummer teaches what to do,
When joy outweighs the need for prayers,
The dawn waits just beyond the sound,
And smiles at all it cannot claim,
The night dissolves but leaves around,
The echo of its burning flame.
```

16.
```text
In Amn the dice roll fast and fair,
Then vanish with the coming sun,
Midsummer proves the risk we dare,
Is worth the loss when night is done,
The ledgers open, order wakes,
Yet something brighter lingers still,
The year remembers what it takes,
To bend the rule without the will.
```

17.
```text
Calimshan gates stand open wide,
No shade is drawn against the heat,
Midsummer sets restraint aside,
And lets the city find its beat,
The stars grow pale as dawn draws near,
But no one mourns the night's retreat,
The joy is stored like summer cheer,
To warm the colder days we meet.
```

18.
```text
In Tethyr barns the fiddle cries,
And boots strike time on beaten floor,
Midsummer lifts the mortal eyes,
To worlds they had not seen before,
The fire burns low, the music slows,
Yet bonds are forged that will not break,
The year moves on, but always knows,
What one bright night was meant to make.
```

19.
```text
At Baldur's Gate the dawn comes late,
As if the sun itself delayed,
Midsummer bargains hard with fate,
And wins the time it has not paid,
The light returns, the city stirs,
But something glows beneath the skin,
The night belongs to all it was,
And all the joy it drew us in.
```

20.
```text
The night burns bright with borrowed flame,
And laughter spills like scattered gold,
Midsummer cares not rank or name,
But asks the heart to dare be bold,
The hours stretch beyond their count,
Till dawn itself seems slow to wake,
The year ascends its highest mount,
Then leaves us changed for joy we take.
```

##### `quips.festival.midsummer.medium` (36 entries)

1.
```text
On Waterdeep's streets the torches burn,
And shadows leap from stone to stone,
Midsummer makes the city turn,
And claim the night as fully grown.
```

2.
```text
In Amn the ledgers close their eyes,
While dice and cups replace the pen,
Midsummer teaches how the wise,
Can lose themselves and still be men.
```

3.
```text
In Calimshan the courtyards roar,
With drums that race the beating heart,
Midsummer throws the doors wide open,
And calls restraint a timid art.
```

4.
```text
In Tethyr fields the bonfires rise,
Their sparks like stars against the dark,
Midsummer writes across the skies,
A promise fierce and hard to mark.
```

5.
```text
At Baldur's Gate the river shines,
With lanterns drifting, slow and bright,
Midsummer blurs the careful lines,
Between the day and deeper night.
```

6.
```text
In Saltmarsh fires line the shore,
And sailors dance on cooling sand,
Midsummer asks for nothing more,
Than letting go by joined-up hand.
```

7.
```text
A wreath is passed from head to head,
Till laughter crowns the poorest soul,
Midsummer leaves no wish unsaid,
And makes excess a rightful goal.
```

8.
```text
On Waterdeep's wall the watch looks down,
Yet joins the song they swore to keep,
Midsummer pulls the city crown,
And lets it laugh instead of sleep.
```

9.
```text
In Amn the merchants trade in cheer,
For one warm night of reckless play,
Midsummer spends the careful year,
In hours it will not repay.
```

10.
```text
Calishite dancers spin till dawn,
Their anklets tapping stone and tile,
Midsummer proves the dark is gone,
By stretching joy mile after mile.
```

11.
```text
Tethyr's knights lay helms aside,
And share a cup with farm and field,
Midsummer flattens rank and pride,
And shows what dropping guard can yield.
```

12.
```text
At Baldur's Gate the bells ring wild,
Then lose the count of why they rang,
Midsummer keeps the heart a child,
Long after careful rules have sang.
```

13.
```text
In Saltmarsh nets lie dry and clean,
While songs replace the call of trade,
Midsummer crowns the space between,
The work we did and plans we made.
```

14.
```text
Heat clings thick in torchlit air,
Yet no one asks the night to cool,
Midsummer frees the careful prayer,
And crowns excess the only rule.
```

15.
```text
On Waterdeep's long market row,
The stalls stay lit till morning gray,
Midsummer lets the future know,
That some debts fade by break of day.
```

16.
```text
In Amn a toast is raised too high,
And spilled with laughter on the stone,
Midsummer teaches how to try,
To lose control and not be lone.
```

17.
```text
Calimshan's incense clouds the street,
As drums and flutes refuse to cease,
Midsummer makes the city meet,
In sweat and sound and reckless peace.
```

18.
```text
In Tethyr fields the fire rings,
Grow wide as vows are sung aloud,
Midsummer trades in living things,
Not titles earned or banners bowed.
```

19.
```text
At Baldur's Gate the river laughs,
And slaps the quay in time with song,
Midsummer counts the foolish crafts,
That teach the brave where they belong.
```

20.
```text
In Saltmarsh children chase the sparks,
That leap and die against the night,
Midsummer lights the water dark,
And teaches fear to yield to light.
```

21.
```text
A kiss is stolen, cheered, returned,
Before the next drumbeat can land,
Midsummer proves the rules we learned,
Can bend without a guiding hand.
```

22.
```text
On Waterdeep's high towers bright,
The watch forgets the hour late,
Midsummer bargains with the night,
And keeps the dawn at city gate.
```

23.
```text
In Amn the streets stay loud and warm,
Till even sleep gives up the fight,
Midsummer rides the gathering storm,
And crowns the heat the truest right.
```

24.
```text
Calishite poets trade their themes,
For verses sharp with wine and flame,
Midsummer loosens older dreams,
And laughs at order, shame, and name.
```

25.
```text
In Tethyr barns the fiddle cries,
And boots strike time on beaten floor,
Midsummer lifts the mortal eyes,
To worlds they had not seen before.
```

26.
```text
At Baldur's Gate the fires roar,
And shadows dance like living things,
Midsummer asks the heart for more,
Than careful thought or measured springs.
```

27.
```text
In Saltmarsh dawn arrives too soon,
With ash and smiles along the quay,
Midsummer fades beneath the moon,
But leaves the taste of being free.
```

28.
```text
Lantern smoke and laughter rise,
Till stars feel close as outstretched hands,
Midsummer draws the distant skies,
Into the streets and common lands.
```

29.
```text
On Waterdeep's broad avenue,
The music drowns the city's cares,
Midsummer teaches what to do,
When joy outweighs the need for prayers.
```

30.
```text
In Amn the dice roll fast and fair,
Then vanish with the coming sun,
Midsummer proves the risk we dare,
Is worth the loss when night is done.
```

31.
```text
Calimshan gates stand open wide,
No shade is drawn against the heat,
Midsummer sets restraint aside,
And lets the city find its beat.
```

32.
```text
In Tethyr the old feuds lie still,
For one bright night of shared delight,
Midsummer bends the iron will,
And calls it human, not a slight.
```

33.
```text
At Baldur's Gate the dawn comes late,
As if the sun itself delayed,
Midsummer presses hard on fate,
And wins the time it has not paid.
```

34.
```text
In Saltmarsh embers glow till morn,
And sailors hum half-forgotten tunes,
Midsummer leaves the people worn,
But richer for the broken runes.
```

35.
```text
A final drum at breaking light,
Then silence spreads its cooling hand,
Midsummer loosens day from night,
And slips away, half-planned.
```

36.
```text
Heat and music share one breath,
As laughter outruns care and fear,
Midsummer mocks the thought of death,
And keeps the longest night held dear.
```

##### `quips.festival.midsummer.short` (47 entries)

1.
```text
Lanterns blaze in Waterdeep night,
Midsummer turns the dark to light.
```

2.
```text
Amnian streets stay warm and loud,
Midsummer draws a merry crowd.
```

3.
```text
Calimshan dances till the dawn,
Midsummer laughs the night is gone.
```

4.
```text
Tethyr's fires leap high and free,
Midsummer claims both land and sea.
```

5.
```text
At Baldur's Gate the wine runs fast,
Midsummer asks the night to last.
```

6.
```text
Saltmarsh bonfires line the shore,
Midsummer calls for one dance more.
```

7.
```text
Garlands crown the city gate,
Midsummer loves the hour late.
```

8.
```text
Drums and bells in blended tune,
Midsummer borrows stars and moon.
```

9.
```text
Heat hangs thick in torchlit air,
Midsummer frees the careful prayer.
```

10.
```text
Wine is spilled for luck and cheer,
Midsummer crowns the turning year.
```

11.
```text
Amn forgets its ledgers clean,
Midsummer favors what is seen.
```

12.
```text
Calishite songs run quick and wild,
Midsummer keeps the heart a child.
```

13.
```text
Tethyr's knights lay helms aside,
Midsummer walks with equal stride.
```

14.
```text
At Baldur's Gate the river gleams,
Midsummer loosens sober dreams.
```

15.
```text
Saltmarsh nets lie cast and still,
Midsummer bends the fisher's will.
```

16.
```text
Torches flare along the quay,
Midsummer sets the shadows free.
```

17.
```text
A kiss is stolen, laughed away,
Midsummer owns the longest day.
```

18.
```text
Drums outtalk the careful mind,
Midsummer leaves the rules behind.
```

19.
```text
Heat and music share one breath,
Midsummer mocks the thought of death.
```

20.
```text
Amn trades coin for song and spice,
Midsummer likes the roll of dice.
```

21.
```text
Calimshan's courts throw wide their doors,
Midsummer asks for nothing more.
```

22.
```text
Tethyr's banners glow like flame,
Midsummer burns away the same.
```

23.
```text
At Baldur's Gate the night stands still,
Midsummer tests the mortal will.
```

24.
```text
Saltmarsh children chase the sparks,
Midsummer lights the water dark.
```

25.
```text
Stars feel close as hands can reach,
Midsummer breaks the careful speech.
```

26.
```text
Lantern smoke and laughter rise,
Midsummer pulls down guarded eyes.
```

27.
```text
Amnian wine runs sweet and red,
Midsummer turns the wise to led.
```

28.
```text
Calishite drums outpace the sun,
Midsummer says the night's begun.
```

29.
```text
Tethyr's roads forget their dust,
Midsummer spends the year's deep trust.
```

30.
```text
At Baldur's Gate the fires roar,
Midsummer asks the heart for more.
```

31.
```text
Saltmarsh boats rock soft and slow,
Midsummer keeps the embers low.
```

32.
```text
A wreath of flowers, half undone,
Midsummer binds the many to one.
```

33.
```text
Heat still clings when dawn draws near,
Midsummer laughs at sober fear.
```

34.
```text
Amn forgives the missing due,
Midsummer favors something new.
```

35.
```text
Calimshan incense clouds the street,
Midsummer makes the night feel sweet.
```

36.
```text
Tethyr's lords and laborers dance,
Midsummer breaks the guarded stance.
```

37.
```text
At Baldur's Gate the bells go mad,
Midsummer claims the joy we had.
```

38.
```text
Saltmarsh sings till throats go raw,
Midsummer bends the sailor's law.
```

39.
```text
A spark leaps high, then fades from sight,
Midsummer spends the longest night.
```

40.
```text
Lanterns float on river skin,
Midsummer lets the wishes in.
```

41.
```text
Amn's hot stones still hum with sound,
Midsummer spins the world around.
```

42.
```text
Calishite laughter cracks the air,
Midsummer frees the hidden prayer.
```

43.
```text
Tethyr's fire rings circle wide,
Midsummer keeps no rank or side.
```

44.
```text
At Baldur's Gate the dawn comes late,
Midsummer bargains hard with fate.
```

45.
```text
Saltmarsh wakes to ash and cheer,
Midsummer leaves its mark all year.
```

46.
```text
A final song at breaking light,
Midsummer loosens day from night.
```

47.
```text
Torches flare where night feels thin,
Midsummer lets the joy rush in.
```

#### `midwinter`

##### `quips.festival.midwinter.long` (50 entries)

1.
```text
On Waterdeep's high winter wall,
The watch bell rings, then fades from sight,
Midwinter makes the proud feel small,
As snow turns stone to silent white,
A lantern guards a tighter flame,
It wastes no glow on empty air,
The cold refines the truest claim,
By testing what we choose to bear.
```

2.
```text
In Amn the guilds close early down,
Yet leave one lantern in the lane,
Midwinter sets aside the crown,
And turns the profit into grain,
A baker slips a loaf unseen,
Where poorest hands will surely reach,
The night stays hard, the fire stays clean,
And mercy makes its quiet speech.
```

3.
```text
In Calimshan the courtyards dim,
Incense curls where fountains sleep,
Midwinter trims the loud to slim,
And keeps the whispered vows we keep,
Tea warms the palms with spiced-up heat,
While poets trade a softer rhyme,
The cold is met with steady feet,
And candles buy a little time.
```

4.
```text
In Tethyr halls the banners rest,
The hearth is judge, the stew is king,
Midwinter tests the soldier's chest,
And turns the iron into sing,
A captain shares his cloak in wool,
With lads who guard the gate at night,
The wind may bite, the bell may toll,
But comrades keep the lantern bright.
```

5.
```text
At Baldur's Gate the docks go still,
The tide pulls dark beneath the pier,
Midwinter calls a softer will,
Where soup is shared and fear grows clear,
A prayer is said for ships now lost,
And names are kept in salted breath,
The living pay a gentler cost,
By loving more in face of death.
```

6.
```text
The sea looks hard as hammered glass,
Yet lanterns lean to prove it wrong,
Midwinter lets the silence pass,
Then answers back with low-lit song,
A rope is mended, knot by knot,
With fingers numb but will intact,
The cold may claim the warming pot,
But hands still learn the craft of act.
```

7.
```text
A priest in Dock Ward speaks in plain,
No gilded word, no jeweled show,
Midwinter blesses bread and gain,
And asks the hands to give, not hoard,
The bell rings once, then holds its breath,
As if the night were listening near,
The lesson isn't fear of death,
But how to keep the living dear.
```

8.
```text
An Amnian ledger closes tight,
But one coin rolls to buy a bowl,
Midwinter turns a count to right,
And warms the purse that warms a soul,
The market hush is not a lack,
It is a pause the town has earned,
The cold may keep the footsteps slack,
Yet kindness is the heat returned.
```

9.
```text
Calishite poets trade a rhyme,
To sweeten cold that will not bend,
Midwinter stretches out the time,
So every line can find its end,
A lamp is painted crescent-thin,
To borrow moonlight for the street,
The dark is held at bay within,
By music made of guarded heat.
```

10.
```text
Tethyrian patrols move lantern-slow,
They mark the doors that need repair,
Midwinter teaches how to know,
That safety starts with simple care,
A shutter shakes beneath the gust,
But holds by nail and weathered frame,
The town survives by stubborn trust,
And keeps its peace without a name.
```

11.
```text
In Saltmarsh nets are mended clean,
And knots are tied with patient hands,
Midwinter keeps the water mean,
But blesses work that understands,
A bowl is set for those at sea,
A toast is raised, then voices cease,
The cold may ask what fate will be,
But fellowship still bargains peace.
```

12.
```text
A kettle hums, then starts to sing,
Its steam writes ghosts on window glass,
Midwinter makes the hearth a thing,
That turns the cold into a class,
Hands circle close around the heat,
And stories lean in softer tone,
The night may press with bitter sleet,
But home is built of shared-alone.
```

13.
```text
In Calim's shadow, lanterns glow,
Like small suns trapped in painted tin,
Midwinter makes the alleys slow,
And lets the quiet settle in,
A shrine is swept, a candle set,
A vow is whispered, low and clear,
The dark remembers every debt,
And mercy keeps the balance here.
```

14.
```text
On Waterdeep's stone steps at dusk,
A street-song rises, thin and bright,
Midwinter sheds the loud and brusque,
And teaches voices how to light,
The guild bells sleep behind their doors,
Yet children chalk a star in snow,
The cold may guard the city's floors,
But hope still learns to walk and go.
```

15.
```text
In Amn the coin-lords bow their heads,
For one night's truce with hunger's claim,
Midwinter counts the loaves instead,
And calls that mercy by its name,
A soup pot steams in market square,
While guards pretend they do not see,
The rich may keep their silken care,
But kindness buys community.
```

16.
```text
Tethyr renews its oaths in fire,
Not with a blade, but steady heat,
Midwinter lowers old desire,
And makes the promise bittersweet,
The banner hangs in quiet rest,
While watchmen trade a weary grin,
The cold may test the soldier's chest,
But duty keeps the warmth within.
```

17.
```text
At Baldur's Gate a captain sighs,
And shares his cloak with dockside kin,
Midwinter sees through hardened eyes,
And finds the human tucked within,
The tide comes slow with iron breath,
It drags the dark along the pier,
We do not conquer cold or death,
We simply keep our people near.
```

18.
```text
The sea wind bites the cheek in two,
Yet mugs are passed from hand to hand,
Midwinter proves the old is true,
That warmth is made, not planned,
A lantern sways above the street,
It fights the gust with stubborn flame,
The night may press with hungry sleet,
But fellowship stays much the same.
```

19.
```text
On Waterdeep's broad winter street,
A single laugh runs clear and far,
Midwinter makes the moment sweet,
And hangs it like a lucky star,
The snow turns gray where carts have rolled,
Yet candles keep their golden right,
The cold may make the fingers old,
But song can still outlast the night.
```

20.
```text
In Amn the caravaners rest,
And mend the straps by candle's glow,
Midwinter teaches what is best,
Is fixing now before you go,
A mule-bell taps a quieter beat,
In stables warmed by patient straw,
The road is hard beneath your feet,
But care is stronger than the thaw.
```

21.
```text
In Calimshan the music thins,
To finger-drums and soft refrain,
Midwinter loosens hardened grins,
And turns the cold to gentle rain,
Courtyards trade their splashing sound,
For whispers tucked in cloaks of spice,
The night may press the city down,
Yet hearts still pay a kinder price.
```

22.
```text
In Tethyr's courts the tongues grow spare,
They hear the hearth more than the throne,
Midwinter strips the lies between,
And leaves the simple truth alone,
A judge sets aside one sharp decree,
To spare a widow's winter bread,
The cold may ask what law should be,
But mercy walks where pride has fled.
```

23.
```text
In Saltmarsh taverns dim their blaze,
And tell one tale, then tell no more,
Midwinter shortens rowdy days,
And keeps the peace behind the door,
A fiddler strings a quieter tune,
To match the sea's restrained reply,
The night is deep beneath the moon,
Yet warm hands will not let it die.
```

24.
```text
A bellrope burns the naked palm,
Yet still the toll is duly made,
Midwinter's lesson isn't calm,
But doing good though sorely paid,
The watchman's breath turns white and thin,
He stamps his feet and checks the gate,
The cold may creep beneath the skin,
But duty will not come too late.
```

25.
```text
In Calimshan the tea is spiced,
The cups are small, the warmth is deep,
Midwinter makes the poorest nice,
By letting neighbors stay and sleep,
A mat is laid on tiled-up stone,
A blanket shared without a fuss,
The night is hard, the wind is grown,
But kindness still is what saves us.
```

26.
```text
At Baldur's Gate the lanterns sway,
Above the quay's black, frozen shine,
Midwinter calls the night to stay,
But lets the hearth declare its line,
A fisher brings a bowl of stew,
To strangers new to dockside life,
The cold may bite, the tide may chew,
But sharing dulls the sharpest knife.
```

27.
```text
On Waterdeep's long icy lane,
A carol climbs, then turns to hush,
Midwinter does not waste the strain,
It makes the last note clean, not brusque,
A child drops coins in temple box,
And smiles as if it were a game,
The cold may lock the city's locks,
But giving keeps the heart the same.
```

28.
```text
In Amn the ink goes still and dry,
Ledgers rest for one slow night,
Midwinter asks the rich to try,
A simpler kind of measured right,
A guildmaster signs a smaller fee,
For those who cannot pay it yet,
The cold may claim what futures be,
But mercy settles honest debt.
```

29.
```text
In Tethyr guards share bread and salt,
At the old gate's frozen seam,
Midwinter turns the smallest halt,
To fellowship that warms a dream,
A lantern's glass is cracked and thin,
Yet still it holds its steady fire,
The cold may press its knuckles in,
But friends refuse to call it dire.
```

30.
```text
At Baldur's Gate the casks are low,
But laughter finds a way to stay,
Midwinter lets the lanterns glow,
And keeps the wolves of want at bay,
A dockcat curls on coalside stone,
It purrs like peace in ragged fur,
The night is sharp, the wind has grown,
Yet warmth persists because we were.
```

31.
```text
In Calimshan the poets grin,
And rhyme the cold into a jest,
Midwinter lets the mirth begin,
Then tucks it safely in the chest,
A spice-seller shares a sugared bite,
With guards who patrol lantern-lit,
The night is long, the stars are bright,
But jokes can keep the edges knit.
```

32.
```text
Saltmarsh children carve a star,
In frost along the tavern sill,
Midwinter shows how small things are,
The ones that keep the darkness still,
A sailor ties a lucky knot,
And hangs it under beam and rafter,
The cold may claim the warming pot,
But not the echo of our laughter.
```

33.
```text
On Waterdeep's Dock Ward cobbles slick,
A lantern swings in salted gust,
Midwinter makes the footsteps quick,
Yet asks the heart to choose its trust,
A tavern keeps one table free,
For sailors late from distant foam,
The cold may sharpen misery,
But welcome turns the street to home.
```

34.
```text
In Calimshan the rooftops gleam,
With frost that fades to perfumed air,
Midwinter moves like quiet dream,
Through courtyards hung with crescent flare,
A storyteller lowers his voice,
To make the smallest children hear,
The cold may take away our choice,
But tales can keep the brave sincere.
```

35.
```text
In Tethyr's outer farms at dusk,
A bonfire burns with steady flame,
Midwinter sheds the bright and brusque,
And teaches hands to do the same,
Neighbors share a salted pie,
And mend a fence by lantern light,
The cold may press the cattle nigh,
But work and bread can set it right.
```

36.
```text
At Baldur's Gate the tide runs black,
And drags the night along the pier,
Midwinter keeps the lanterns back,
Yet makes the quiet strangely clear,
A dockhand hums a sailor's tune,
And passes it to those who wait,
The cold may claim the coming moon,
But song still finds the open gate.
```

37.
```text
In Saltmarsh marshes, reeds stand stiff,
And ice makes silver of the pool,
Midwinter pulls the sky to cliff,
And turns the shallow water cool,
A priestess ties a cedar charm,
Above the door to ward the ill,
The cold may keep the world from warm,
But kindness keeps the hearthfire still.
```

38.
```text
In Amn the counting-houses close,
Their shutters tight against the night,
Midwinter cools the merchant's pose,
And weighs the purse against the right,
A clerk sets down his careful pen,
To serve hot broth to those outside,
The cold may come again and again,
But giving keeps the soul supplied.
```

39.
```text
On Waterdeep's gatehouse steps at noon,
A sermon ends with simple bread,
Midwinter favors plainer tune,
Than gilded words that turn the head,
The priest names hunger, names the poor,
Then names the hands that choose to give,
The cold may stand outside the door,
But kindness makes the city live.
```

40.
```text
In Tethyr's chapel, candles burn,
In rows like guards against the night,
Midwinter asks the heart to learn,
To hold its vows in steady light,
A widow lays a sprig of pine,
And whispers names into the flame,
The cold may harden every line,
But memory keeps the warmth the same.
```

41.
```text
In Calimshan the fountain's sleep,
Is broken by a copper coin,
Midwinter keeps its silence deep,
But lets a wish and water join,
A child looks up at crescent lamps,
And counts them like a prayer in light,
The night is wide, the wind is damp,
Yet hope can keep its footing right.
```

42.
```text
At Baldur's Gate the harbor guard,
Marks footprints where the snow is thin,
Midwinter keeps the streets too hard,
For easy lies to wander in,
A thief returns a stolen loaf,
When soup is offered without blame,
The cold may test the truth of oaths,
But mercy can reforge a name.
```

43.
```text
In Saltmarsh, fishers mend their lines,
With faces red and fingers numb,
Midwinter reads the sea's designs,
And asks what storms will surely come,
A bowl is poured for those offshore,
A toast is raised, then voices cease,
The cold may ask what fate is for,
But fellowship still bargains peace.
```

44.
```text
On Waterdeep's high towers, bright,
The frost makes windows thin as glass,
Midwinter holds the city tight,
And lets the loudest boasting pass,
A guildmaster opens stores of coal,
For alleys where the poor still sleep,
The cold may take its hungry toll,
But mercy keeps the ledger deep.
```

45.
```text
In Amn the temple steps are swept,
And salt is scattered by the door,
Midwinter keeps the promise kept,
That none should freeze on Amnish floor,
A priestess blesses bread and oil,
Then turns to warm a traveler's hands,
The cold may ask for harder toil,
But care still loosens winter's bands.
```

46.
```text
In Calimshan the night bazaar,
Grows quiet under lantern glow,
Midwinter cools the loudest jar,
And makes the softer voices show,
A dancer wraps in wool and laughs,
At jests that rhyme the cold away,
The wind may scrape the courtyard's path,
But mirth can keep the dark at bay.
```

47.
```text
In Tethyr's gate the sentries stand,
Their breath like smoke, their hands like stone,
Midwinter asks for more than command,
It asks the heart to not be lone,
A bowl of stew is passed in turn,
A hymn is hummed beneath the teeth,
The cold may make the knuckles burn,
But comrades share the warming wreath.
```

48.
```text
At Baldur's Gate the river's mouth,
Turns black beneath a moonless sky,
Midwinter walks the quay from south,
And makes the bravest questions why,
A dockwife sets a candle out,
For sailors late from distant foam,
The cold may sharpen every doubt,
But welcome turns the street to home.
```

49.
```text
In Saltmarsh marsh the reeds stand tall,
Their tips like needles in the frost,
Midwinter keeps the nightfall all,
And counts the days that summer lost,
A charm of cedar, tied with twine,
Is hung above the lintel beam,
The cold may press its bitter line,
But hearthfire holds the warmer dream.
```

50.
```text
In Amn by Athkatla's colder ledger,
The bells keep time when streets turn still,
Midwinter asks the proud grow sober ledger,
And teaches busy hands to still,
A candle's glow is set, quiet and spare,
It travels warm from shore to shore,
The cold may sharpen every stare,
But kindness holds the shore to shore.
```

##### `quips.festival.midwinter.medium` (50 entries)

1.
```text
On Waterdeep's high winter wall,
The watch bell rings, then waits for more,
Midwinter makes the proud feel small,
And teaches warmth what gates are for.
```

2.
```text
In Amn the guilds close early down,
Yet leave one lantern in the lane,
Midwinter keeps the market's crown,
By turning profit into grain.
```

3.
```text
In Calimshan the courtyards dim,
Incense curls where fountains sleep,
Midwinter trims the loud to slim,
And keeps the whispered vows we keep.
```

4.
```text
In Tethyr halls the banners rest,
The hearth is judge, the stew is king,
Midwinter tests the soldier's chest,
And softens iron into sing.
```

5.
```text
At Baldur's Gate the docks stand still,
The tide pulls dark beneath the pier,
Midwinter calls a softer will,
Where soup is shared and fear grows clear.
```

6.
```text
The sea looks hard as hammered glass,
Yet lanterns lean to prove it wrong,
Midwinter lets the silence pass,
Then answers back with low-lit song.
```

7.
```text
A priest in Dock Ward speaks in plain,
No gilded word, no jeweled show,
Midwinter blesses bread and gain,
And asks the hands to give, not hoard.
```

8.
```text
An Amnian ledger closes tight,
But one coin rolls to buy a bowl,
Midwinter turns a count to right,
And warms the purse that warms a soul.
```

9.
```text
Calishite poets trade a rhyme,
To sweeten cold that will not bend,
Midwinter stretches out the time,
So every line can find its end.
```

10.
```text
Tethyrian patrols move lantern-slow,
They mark the doors that need repair,
Midwinter teaches how to know,
That safety starts with simple care.
```

11.
```text
In Saltmarsh nets are mended clean,
And knots are tied with patient hands,
Midwinter keeps the water mean,
But blesses work that understands.
```

12.
```text
The bell rings once, then holds its breath,
As if the night were listening near,
Midwinter names the shape of death,
Then pays it back with stubborn cheer.
```

13.
```text
A kettle hums, then starts to sing,
Its steam writes ghosts on window glass,
Midwinter makes the hearth a thing,
That turns the cold into a class.
```

14.
```text
In Calim's shadow, lanterns glow,
Like small suns trapped in painted tin,
Midwinter makes the alleys slow,
And lets the quiet settle in.
```

15.
```text
On Waterdeep's stone steps at dusk,
A street-song rises, thin and bright,
Midwinter sheds the loud and brusque,
And teaches voices how to light.
```

16.
```text
In Amn the coin-lords bow their heads,
For one night's truce with hunger's claim,
Midwinter counts the loaves instead,
And calls that mercy by its name.
```

17.
```text
Tethyr renews its oaths in fire,
Not with a blade, but steady heat,
Midwinter lowers old desire,
And makes the promise bittersweet.
```

18.
```text
At Baldur's Gate a captain sighs,
And shares his cloak with dockside kin,
Midwinter sees through hardened eyes,
And finds the human tucked within.
```

19.
```text
The sea wind bites the cheek in two,
Yet mugs are passed from hand to hand,
Midwinter proves the old is true,
That warmth is made, not planned.
```

20.
```text
A shrine gets swept, a candle set,
In Calimshan's perfumed night,
Midwinter won't forget the debt,
Of giving dark a little light.
```

21.
```text
In Waterdeep the guild bells sleep,
But children tag the snow with chalk,
Midwinter keeps the secrets deep,
Yet lets the young teach hope to walk.
```

22.
```text
An Amnian baker leaves a loaf,
Where poorest steps will surely find,
Midwinter turns that simple oath,
To bread that feeds the town's own kind.
```

23.
```text
Tethyr's knights stand watch in white,
Their breath like smoke, their hands like stone,
Midwinter asks for more than fight,
It asks the heart to not be lone.
```

24.
```text
Saltmarsh taverns dim their blaze,
And tell one tale, then tell no more,
Midwinter shortens rowdy days,
And keeps the peace behind the door.
```

25.
```text
A bellrope burns the naked palm,
Yet still the toll is duly made,
Midwinter's lesson isn't calm,
But doing good though sorely paid.
```

26.
```text
In Calimshan the tea is spiced,
The cups are small, the warmth is deep,
Midwinter makes the poorest nice,
By letting neighbors stay and sleep.
```

27.
```text
At Baldur's Gate the lanterns sway,
Above the quay's black, frozen shine,
Midwinter calls the night to stay,
But lets the hearth declare its line.
```

28.
```text
On Waterdeep's broad winter street,
A single laugh runs clear and far,
Midwinter makes the moment sweet,
And hangs it like a lucky star.
```

29.
```text
In Amn the caravaners rest,
And mend the straps by candle's glow,
Midwinter teaches what is best,
Is fixing now before you go.
```

30.
```text
Tethyr's courts grow quiet-keen,
They hear the hearth more than the throne,
Midwinter strips the lies between,
And leaves the simple truth alone.
```

31.
```text
Saltmarsh fishers share their rum,
And set a bowl for those at sea,
Midwinter says, "Let kindness come,"
And counts that gift as piety.
```

32.
```text
In Calim's lanes the music thins,
To finger-drums and soft refrain,
Midwinter loosens hardened grins,
And turns the cold to gentle rain.
```

33.
```text
A watchman's lantern guards the gate,
A small sun in the frozen air,
Midwinter teaches how to wait,
By standing firm and staying fair.
```

34.
```text
In Waterdeep the snow turns gray,
But candles keep their golden right,
Midwinter doesn't chase away,
The dark-just teaches it to bite.
```

35.
```text
An Amnian priest speaks low and brief,
And blesses coin, then blesses bread,
Midwinter weighs the shape of grief,
And finds the need that lies ahead.
```

36.
```text
Tethyr's hearthstones glow like gold,
While shutters shake beneath the gust,
Midwinter favors steady hold,
And crowns the quiet kind of trust.
```

37.
```text
At Baldur's Gate the tide comes slow,
It drags the night along the pier,
Midwinter bids the lanterns glow,
And tells the living, "Stay you near."
```

38.
```text
In Calimshan the incense curls,
It writes small rings in candle smoke,
Midwinter gathers boys and girls,
Around a tale an elder spoke.
```

39.
```text
Saltmarsh ropes grow stiff and pale,
Yet knots are tied with patient skill,
Midwinter makes the fingers fail,
Then teaches hands to finish still.
```

40.
```text
On Waterdeep's tavern bench,
A stranger shares a warming cup,
Midwinter does not mind the stench,
Of streets-so long as hearts hold up.
```

41.
```text
In Amn the guildhall doors are shut,
But soup is ladled in the square,
Midwinter pays the poor their cut,
In kindness set like coin to spare.
```

42.
```text
Tethyr renews its banner vows,
With candlelight and quiet knees,
Midwinter teaches how to bow,
Without surrendering to freeze.
```

43.
```text
At Baldur's Gate a prayer is said,
For ships that never found the shore,
Midwinter keeps the names not dead,
And lets the living love them more.
```

44.
```text
In Calim's night the lamps are bright,
Yet voices drop to softer speech,
Midwinter makes the world less tight,
By giving hush the right to teach.
```

45.
```text
Saltmarsh children carve a star,
In frost along the tavern sill,
Midwinter shows how small things are,
The ones that keep the darkness still.
```

46.
```text
On Waterdeep's long icy lane,
A carol climbs, then turns to hush,
Midwinter does not waste the strain,
It makes the last note clean, not brusque.
```

47.
```text
In Amn the ink goes still and dry,
Ledgers rest for one slow night,
Midwinter asks the rich to try,
A simpler kind of measured right.
```

48.
```text
Tethyr's guards share bread and salt,
At the old gate's frozen seam,
Midwinter turns the smallest halt,
To fellowship that warms a dream.
```

49.
```text
At Baldur's Gate the casks are low,
But laughter finds a way to stay,
Midwinter lets the lanterns glow,
And keeps the wolves of want at bay.
```

50.
```text
In Calimshan the poets grin,
And rhyme the cold into a jest,
Midwinter lets the mirth begin,
Then tucks it safely in the chest.
```

##### `quips.festival.midwinter.short` (50 entries)

1.
```text
Midwinter hush on Waterdeep's stone,
The bells ring clear, then leave you alone.
```

2.
```text
Amnian coins are counted slow,
When Midwinter's quiet starts to show.
```

3.
```text
Calimshan lights its incense flame,
To warm the night that has no name.
```

4.
```text
Tethyrian hearths burn steady and bright,
To keep the cold from winning the night.
```

5.
```text
On Baldur's Gate the docks stand still,
While soup and song replace the chill.
```

6.
```text
The sea wears glass, the gulls fly thin,
Midwinter keeps the warmth within.
```

7.
```text
A candle speaks with smaller fire,
Midwinter asks for less desire.
```

8.
```text
Guild bells pause, then ring once more,
To bless the streets and guard the door.
```

9.
```text
A cloaked patrol walks lantern-lit,
Midwinter likes a careful wit.
```

10.
```text
Saltmarsh nets are mended tight,
Midwinter favors work done right.
```

11.
```text
Hot bread shared in market square,
Midwinter turns the air to care.
```

12.
```text
A sailor's oath, a quiet nod,
Midwinter counts what's owed to God.
```

13.
```text
Frost on rail and iron ring,
Midwinter makes a hard note sing.
```

14.
```text
Winter wine and spiced-up cheer,
Midwinter keeps the friends still near.
```

15.
```text
A cat takes throne beside the coals,
Midwinter crowns the smallest souls.
```

16.
```text
Lanterns bloom along the quay,
Midwinter teaches how to be.
```

17.
```text
A priest in Amn speaks low and plain,
Midwinter blesses grain and gain.
```

18.
```text
Calishite poets trade soft rhyme,
Midwinter slows the clock of time.
```

19.
```text
Tethyr's banners hang at rest,
Midwinter puts pride to the test.
```

20.
```text
A dockside drum goes mute and mild,
Midwinter makes the loud grow child.
```

21.
```text
Old vows renewed at city gate,
Midwinter teaches how to wait.
```

22.
```text
A single bell at midnight rings,
Midwinter hears the hidden things.
```

23.
```text
Warm stew in bowls of battered tin,
Midwinter lets the thaw begin.
```

24.
```text
Fires crackle, stories lean,
Midwinter keeps the edges clean.
```

25.
```text
A ship's bell taps a gentler beat,
Midwinter brings the crew to meet.
```

26.
```text
A candle end still smells of light,
Midwinter holds it through the night.
```

27.
```text
Watchmen trade a quiet grin,
Midwinter knows the jokes within.
```

28.
```text
Snow in alleys, salt in hand,
Midwinter makes the city stand.
```

29.
```text
Coins are fewer, kindness more,
Midwinter opens every door.
```

30.
```text
A lantern sways above the street,
Midwinter makes the cold retreat.
```

31.
```text
Sea-wind bites, but hearth-wind stays,
Midwinter teaches gentler ways.
```

32.
```text
A prayer said in Dock Ward gloom,
Midwinter turns it into room.
```

33.
```text
Amnian guilds forgive a fee,
Midwinter likes a mercy spree.
```

34.
```text
Calimshan spices warm the air,
Midwinter meets the market fair.
```

35.
```text
Tethyr's knights stand watch in white,
Midwinter steels the heart for fight.
```

36.
```text
Saltmarsh taverns dim their blaze,
Midwinter softens rowdy days.
```

37.
```text
A fishwife laughs at frozen spray,
Midwinter lets her have her say.
```

38.
```text
The quay grows still, the stars look close,
Midwinter keeps the sea's mouth closed.
```

39.
```text
A bellrope frays where hands are numb,
Midwinter says, "Hold fast-then come."
```

40.
```text
Hot tea steams in gloved-up hands,
Midwinter loosens winter's bands.
```

41.
```text
A cloak is shared, a secret told,
Midwinter buys its warmth with cold.
```

42.
```text
A lantern painted crescent-bright,
Midwinter borrows moonlit light.
```

43.
```text
Street kids sing a thin refrain,
Midwinter pays them back in grain.
```

44.
```text
A baker's pledge, a loaf set free,
Midwinter makes a family.
```

45.
```text
A shrine in Calim's shadowed lane,
Midwinter lifts the quiet pain.
```

46.
```text
A dockcat curls on Amnian ledgers,
Midwinter laughs at careful measures.
```

47.
```text
Tethyrian hearthstones glow like gold,
Midwinter keeps the brave from cold.
```

48.
```text
Waterdeep's yawning gates are shut,
Midwinter keeps the night from glut.
```

49.
```text
A sailor's charm on braided twine,
Midwinter turns it into sign.
```

50.
```text
One last toast, then voices cease,
Midwinter bargains hard for peace.
```

#### `midwinterseve`

##### `quips.festival.midwinterseve.long` (15 entries)

1.
```text
On Waterdeep's streets the lamps burn low,
As one year loosens careful hold,
Midwinter's Eve asks us to slow,
And count what warmed us from the cold,
No banner waves, no bell is rung,
The city breathes without decree,
The year is closed by what we've done,
Not by what we claim to be.
```

2.
```text
In Amn the ledgers close at last,
No sum is chased beyond the night,
Year's Turning weighs the future past,
And sets the balance by candlelight,
A coin is set aside in care,
For needs that names have yet to wear,
The year is judged not just by gain,
But mercy's quiet, patient reign.
```

3.
```text
In Calimshan the courtyards hush,
The drums laid down, the incense thin,
Midwinter's Eve waits in the hush,
Where endings fold to start again,
The year is named by loss and grace,
By what was held and what let go,
The night becomes the only place,
Where time agrees to move more slow.
```

4.
```text
In Tethyr halls the hearth burns small,
No banner waved, no oath renewed,
Year's Turning hears the quiet call,
Of gratitude for what endured,
The fire remembers hands long gone,
That built the walls and kept them sound,
The year turns not by crown or dawn,
But by the trust still underground.
```

5.
```text
At Baldur's Gate the harbor rests,
The bells unswung, the tide run slow,
Midwinter's Eve counts silent guests,
Who shaped the year we've come to know,
The river mirrors fading stars,
And carries secrets out to sea,
The city learns its hidden scars,
Are part of what it means to be.
```

6.
```text
In Saltmarsh stars reflect the sea,
As nets and fears are set aside,
Year's Turning lets the people be,
Between the ebb and coming tide,
The longest night is met, not fought,
The dark is held without alarm,
The year is closed by what we thought,
And opened by what kept us warm.
```

7.
```text
A candle lit for what was lost,
Another for what yet may be,
Midwinter's Eve accepts the cost,
Of loving time's fragility,
The flames burn down without a sound,
Yet leave the room more fully known,
The year is gone, but we are found,
Still standing, still not overthrown.
```

8.
```text
On Waterdeep's walls the watch stands still,
The city breathes without command,
Year's Turning bends the iron will,
And leaves the moment unplanned,
The rules that shaped the passing days,
Are set aside without dispute,
The year concludes in quiet ways,
Where strength is shown by resolute.
```

9.
```text
In Amn a cup is raised, not high,
But held and warmed by steady hands,
Midwinter's Eve lets old debts lie,
And trusts what patience understands,
The year was hard, the year was kind,
The balance rests in human care,
What mattered most was not the line,
But who was still beside us there.
```

10.
```text
Calimshan names the year by pain,
And also by what helped it stand,
Year's Turning keeps the loss and gain,
In equal, open, waiting hand,
No verdict falls, no judgment made,
The night accepts without demand,
The year is neither praised nor blamed,
But set to rest as it was planned.
```

11.
```text
In Tethyr watchmen walk more slow,
And nod to faces long since known,
Midwinter's Eve lets duty go,
Enough to feel they're not alone,
The roads lie bare, the fields at peace,
The frost takes hold of furrowed land,
The year concludes with a release,
No order forced, no crown command.
```

12.
```text
At Baldur's Gate the river sighs,
And mirrors lamps like fading stars,
Year's Turning hears what never cries,
But shaped us quietly with scars,
The city waits without demand,
For dawn to name the coming year,
The night itself extends a hand,
And says that holding still is dear.
```

13.
```text
In Saltmarsh fires are banked to coals,
The longest night is met, not feared,
Midwinter's Eve steadies souls,
With truths we carried all the year,
The sea pulls slow, the stars hold fast,
The boats remain, the work can wait,
The year is finished, firm and past,
And peace arrives unchallenged, late.
```

14.
```text
A breath between the old and new,
Where nothing must be said or sworn,
Year's Turning lets the silence do,
What words cannot before the morn,
The past steps back, the future waits,
No one commands the shift to start,
The year turns not by opened gates,
But by the calm within the heart.
```

15.
```text
The night grows calm, the year steps down,
No bell is rung, no crown is worn,
Midwinter's Eve unthreads the crown,
That time itself had tightly sworn,
The past releases, not erased,
The future waits without a name,
The turning comes unforced, unchased,
And leaves us changed, but much the same.
```

##### `quips.festival.midwinterseve.medium` (29 entries)

1.
```text
On Waterdeep's streets the lamps burn low,
As one year loosens careful hold,
Midwinter's Eve asks us to slow,
And count what warmed us from the cold.
```

2.
```text
In Amn the ledgers close at last,
No sum is chased beyond the night,
Year's Turning weighs the future past,
And sets the balance by candlelight.
```

3.
```text
In Calimshan the courtyards hush,
The drums laid down, the incense thin,
Midwinter's Eve waits in the hush,
Where endings fold to start again.
```

4.
```text
In Tethyr halls the hearth burns small,
No banner waved, no oath renewed,
Year's Turning hears the quiet call,
Of gratitude for what endured.
```

5.
```text
At Baldur's Gate the harbor rests,
The bells unswung, the tide run slow,
Midwinter's Eve counts silent guests,
Who shaped the year we've come to know.
```

6.
```text
In Saltmarsh stars reflect the sea,
As nets and fears are set aside,
Year's Turning lets the people be,
Between the ebb and coming tide.
```

7.
```text
A candle lit for what was lost,
Another for what yet may be,
Midwinter's Eve accepts the cost,
Of loving time's fragility.
```

8.
```text
On Waterdeep's walls the watch stands still,
The city breathes without command,
Year's Turning bends the iron will,
And leaves the moment unplanned.
```

9.
```text
In Amn a cup is raised, not high,
But held and warmed by steady hands,
Midwinter's Eve lets old debts lie,
And trusts what patience understands.
```

10.
```text
Calimshan names the year by pain,
And also by what helped it stand,
Year's Turning keeps the loss and gain,
In equal, open, waiting hand.
```

11.
```text
In Tethyr watchmen walk more slow,
And nod to faces long since known,
Midwinter's Eve lets duty go,
Enough to feel they're not alone.
```

12.
```text
At Baldur's Gate the river sighs,
And mirrors lamps like fading stars,
Year's Turning hears what never cries,
But shaped us quietly with scars.
```

13.
```text
In Saltmarsh fires are banked to coals,
The longest night is met, not feared,
Midwinter's Eve steadies souls,
With truths we carried all the year.
```

14.
```text
A breath between the old and new,
Where nothing must be said or sworn,
Year's Turning lets the silence do,
What words cannot before the morn.
```

15.
```text
On Waterdeep's counting stones laid bare,
No numbers written, none erased,
Midwinter's Eve leaves empty air,
Where future sums may yet be placed.
```

16.
```text
In Amn the poor are named aloud,
Not as a debt, but as a care,
Year's Turning humbles wealth and crowd,
By counting mercy as its share.
```

17.
```text
Calimshan's lamps grow fewer still,
The night prefers a gentler flame,
Midwinter's Eve bends time and will,
And loosens guilt as well as blame.
```

18.
```text
In Tethyr roads lie quiet, bare,
No caravan disturbs the frost,
Year's Turning waits in open air,
And honors all the year has cost.
```

19.
```text
At Baldur's Gate the bells stay mute,
The silence chosen, not imposed,
Midwinter's Eve is resolute,
That some things end because they closed.
```

20.
```text
In Saltmarsh the tide pulls breath by breath,
As if the sea itself reflects,
Year's Turning weighs both life and death,
And what each passing year collects.
```

21.
```text
A promise set without a vow,
A hope not spoken, but still known,
Midwinter's Eve asks only now,
That hearts be held, not overthrown.
```

22.
```text
On Waterdeep's long avenue,
The lamps go dark one by one,
Year's Turning leaves the city new,
Before the next year's work's begun.
```

23.
```text
In Amn the doors are shut by choice,
No trade outpaces human need,
Midwinter's Eve lifts the voice,
Of care beyond the weight of greed.
```

24.
```text
Calimshan listens to the dark,
And finds it fuller than the day,
Year's Turning leaves its quiet mark,
That light must also learn to stay.
```

25.
```text
In Tethyr hearthstones glow with rest,
The fire fed just enough to last,
Midwinter's Eve counts what was best,
Not what could never hold the past.
```

26.
```text
At Baldur's Gate the night feels wide,
Unmeasured, free of toll or fee,
Year's Turning lets the city hide,
Within a shared humility.
```

27.
```text
In Saltmarsh elders mark the hour,
By stars, not bells, not spoken sign,
Midwinter's Eve gives fragile power,
To moments never kept in line.
```

28.
```text
The year steps down without demand,
The next steps up without a name,
Year's Turning leaves us where we stand,
Between the dark and coming flame.
```

29.
```text
The year pauses, neither new nor old,
As lamps burn low and voices cease,
Midwinter's Eve lets time be told,
By silence settling into peace.
```

##### `quips.festival.midwinterseve.short` (46 entries)

1.
```text
Year turns slow in Waterdeep stone,
Midwinter's Eve leaves none alone.
```

2.
```text
Amn closes books, then lights one flame,
Year's Turning stays the same.
```

3.
```text
Calimshan hushes drum and song,
Midwinter's Eve waits long.
```

4.
```text
Tethyr binds the old year tight,
Year's Turning guards the night.
```

5.
```text
At Baldur's Gate the bells fall still,
Midwinter's Eve bends will.
```

6.
```text
Saltmarsh watches stars and tide,
Year's Turning draws inside.
```

7.
```text
A candle marks what's passed and gone,
Midwinter's Eve holds on.
```

8.
```text
Old vows sleep, new vows breathe,
Year's Turning weaves.
```

9.
```text
Snow or rain or salted air,
Midwinter's Eve is prayer.
```

10.
```text
Time itself seems asked to pause,
Year's Turning draws a cause.
```

11.
```text
Amn forgives the ledger's weight,
Midwinter's Eve waits.
```

12.
```text
Calimshan names the year by loss,
Year's Turning counts the cost.
```

13.
```text
Tethyr's hearth burns low but true,
Midwinter's Eve renews.
```

14.
```text
At Baldur's Gate the harbor rests,
Year's Turning tests.
```

15.
```text
Saltmarsh listens to the dark,
Midwinter's Eve marks.
```

16.
```text
A breath between what was and will,
Year's Turning still.
```

17.
```text
Promises set gently down,
Midwinter's Eve un-crowns.
```

18.
```text
The past exhales, the future waits,
Year's Turning states.
```

19.
```text
Amn seals hope against the cold,
Midwinter's Eve holds.
```

20.
```text
Calimshan counts the years in flame,
Year's Turning names.
```

21.
```text
Tethyr thanks the land and dead,
Midwinter's Eve is said.
```

22.
```text
At Baldur's Gate the lamps burn few,
Year's Turning true.
```

23.
```text
Saltmarsh tides pull breath by breath,
Midwinter's Eve and death.
```

24.
```text
A door is closed, another waits,
Year's Turning gates.
```

25.
```text
Memory and promise meet,
Midwinter's Eve complete.
```

26.
```text
Amn sets one coin aside,
Year's Turning abides.
```

27.
```text
Calimshan prays without a sound,
Midwinter's Eve is bound.
```

28.
```text
Tethyr's watch walks slow and kind,
Year's Turning mind.
```

29.
```text
At Baldur's Gate the river sighs,
Midwinter's Eve replies.
```

30.
```text
Saltmarsh marks the longest night,
Year's Turning light.
```

31.
```text
The year lets go without a fight,
Midwinter's Eve night.
```

32.
```text
What was carried now released,
Year's Turning peace.
```

33.
```text
Amn rests its careful hand,
Midwinter's Eve understands.
```

34.
```text
Calimshan lets the old year sleep,
Year's Turning deep.
```

35.
```text
Tethyr's fire burns memory,
Midwinter's Eve keeps.
```

36.
```text
At Baldur's Gate no bell is rung,
Year's Turning sung.
```

37.
```text
Saltmarsh hears the water pray,
Midwinter's Eve stay.
```

38.
```text
A pause where nothing must be done,
Year's Turning begun.
```

39.
```text
The circle closes, then begins,
Midwinter's Eve wins.
```

40.
```text
Amn looks forward without haste,
Year's Turning placed.
```

41.
```text
Calimshan seals the year with breath,
Midwinter's Eve and death.
```

42.
```text
Tethyr thanks the turning wheel,
Year's Turning real.
```

43.
```text
At Baldur's Gate the night holds fast,
Midwinter's Eve past.
```

44.
```text
Saltmarsh sets its fears aside,
Year's Turning tide.
```

45.
```text
The old year fades, the new draws near,
Midwinter's Eve here.
```

46.
```text
The year exhales, the night stands still,
Midwinter's Eve bends human will.
```

#### `shieldmeet`

##### `quips.festival.shieldmeet.long` (19 entries)

1.
```text
On Waterdeep's high open square,
The bells ring once, then hold their breath,
Shieldmeet asks the city where,
It stands on justice, law, and faith,
No banner waves, no crown is shown,
The stone remembers every word,
The law stands bare, entirely known,
And waits to see if it is heard.
```

2.
```text
In Amn the ledgers close and ink,
Is set aside for spoken truth,
Shieldmeet makes the merchants think,
Beyond the profit of their youth,
A debt is named, then lessened fair,
Before the watching public eye,
The scales are set in honest air,
And mercy's weight is justified.
```

3.
```text
In Calimshan the courts stand bare,
No music masks the elder's tone,
Shieldmeet strips the layered air,
Till only judgment stands alone,
The verdict falls without a cheer,
But holds the city firm and fast,
The law is felt because it's clear,
And binds the future to the past.
```

4.
```text
In Tethyr halls the banners still,
As oaths are weighed, not loudly sworn,
Shieldmeet tests the steady will,
That keeps the law from being torn,
The crown steps back, the charter stays,
The road and field are bound as one,
The year is set by measured ways,
And duty says the work's begun.
```

5.
```text
At Baldur's Gate the crowd stands tight,
As captains speak of duty owed,
Shieldmeet measures wrong and right,
And names the path the city showed,
No blade is drawn, no blood is paid,
The choice is hard, but clearly made,
The river keeps what words have said,
And flows along the course they laid.
```

6.
```text
In Saltmarsh nets are laid aside,
As fishers gather, voice to voice,
Shieldmeet hears the inward tide,
And crowns the weight of common choice,
A vote is taken, slow and sure,
By lifted hand and steady stare,
The law feels humble, close, and pure,
Because the people placed it there.
```

7.
```text
A charter read in open sound,
Then signed where all the town can see,
Shieldmeet keeps the meaning bound,
To shared and spoken clarity,
No seal is pressed behind a door,
No clause is left to whispered doubt,
The law becomes the commons' core,
Because the light was not shut out.
```

8.
```text
On Waterdeep's stone steps at noon,
A judge speaks plain, without a guard,
Shieldmeet trades the sword for rune,
And asks the law to work its hard,
The sentence lands without delay,
Yet leaves a space for mercy's breath,
The city learns a harder way,
To balance justice, life, and death.
```

9.
```text
In Amn a debt is named and sealed,
Then softened by a kinder hand,
Shieldmeet shows how wounds are healed,
When mercy learns to understand,
The crowd stands still, the ink dries slow,
No cheer, no curse escapes the air,
The law moves on because we know,
Its weight is something all must bear.
```

10.
```text
Calimshan elders lift their gaze,
And name the line that now must stand,
Shieldmeet sets the coming days,
By choosing trust instead of sand,
No song intrudes, no spice is burned,
Until the verdict's shape is clear,
The city holds what it has learned,
And lets the rest dissolve in fear.
```

11.
```text
In Tethyr farmers and the crown,
Renew the pact that binds the road,
Shieldmeet weighs the up and down,
Of land that feeds and laws that load,
The vow is sworn to soil and stone,
Not just to throne or fleeting might,
The year is claimed by what is grown,
And guarded by the shared-up right.
```

12.
```text
At Baldur's Gate the bells ring low,
As rival voices take their turn,
Shieldmeet lets the people know,
What must be faced, not simply burned,
The silence holds like drawn-out breath,
Before the final word is said,
The city chooses life, not death,
And bears the weight of what it read.
```

13.
```text
In Saltmarsh elders mark the day,
With chalk upon the hall's old beam,
Shieldmeet asks the town to say,
What future fits the shared-up dream,
The mark will fade with coming rain,
But memory keeps the promise near,
The law survives not by the stain,
But by the choice we made it here.
```

14.
```text
On Waterdeep's long marble floor,
The city's code is read aloud,
Shieldmeet proves the law is more,
Than symbols worn or titles bowed,
Each clause is weighed, each phrase made plain,
Until no shadow hides the cost,
The law remains because we strain,
To keep what power might have lost.
```

15.
```text
In Amn the guilds renew their trust,
By opening books to public eye,
Shieldmeet counts the fair and just,
And lets the hidden margins die,
The numbers settle, clean and spare,
No flourish left to mask the truth,
The law endures because it's fair,
And speaks to age as well as youth.
```

16.
```text
Calimshan pauses song and spice,
To hear the verdict's final shape,
Shieldmeet makes the careful choice,
That cuts a clean and lasting drape,
The city breathes, then moves ahead,
No riot sparked, no cheer begun,
The law is kept by what was said,
And by the peace that followed on.
```

17.
```text
In Tethyr courts sit open-wide,
No door is shut, no voice denied,
Shieldmeet asks what we will hide,
When nothing can be set aside,
The answer comes in steady tone,
Not all is fixed, not all is right,
But law survives when fully shown,
And faced by honest, shared-up sight.
```

18.
```text
At Baldur's Gate the river waits,
As judgments fall like measured stone,
Shieldmeet opens heavier gates,
By making every reason known,
The current takes the echoes down,
And carries them beyond the quay,
The law remains within the town,
Because it chose transparency.
```

19.
```text
The city gathers, voice to voice,
And weighs the burden of its choice,
Shieldmeet names the path to take,
For justice none may dare forsake,
No crown commands, no blade is drawn,
The law is set from dusk to dawn,
The year is bound by words we keep,
And vows sworn here are sworn in deep.
```

##### `quips.festival.shieldmeet.medium` (36 entries)

1.
```text
On Waterdeep's high open square,
The bells ring once, then hold their breath,
Shieldmeet asks the city where,
It stands on justice, law, and faith.
```

2.
```text
In Amn the ledgers close and ink,
Is set aside for spoken truth,
Shieldmeet makes the merchants think,
Beyond the profit of their youth.
```

3.
```text
In Calimshan the courts stand bare,
No music masks the elder's tone,
Shieldmeet strips the layered air,
Till only judgment stands alone.
```

4.
```text
In Tethyr halls the banners still,
As oaths are weighed, not loudly sworn,
Shieldmeet tests the steady will,
That keeps the law from being torn.
```

5.
```text
At Baldur's Gate the crowd stands tight,
As captains speak of duty owed,
Shieldmeet measures wrong and right,
And names the path the city showed.
```

6.
```text
In Saltmarsh nets are laid aside,
As fishers gather, voice to voice,
Shieldmeet hears the inward tide,
And crowns the weight of common choice.
```

7.
```text
A charter read in open sound,
Then signed where all the town can see,
Shieldmeet keeps the meaning bound,
To shared and spoken clarity.
```

8.
```text
On Waterdeep's stone steps at noon,
A judge speaks plain, without a guard,
Shieldmeet trades the sword for rune,
And asks the law to work its hard.
```

9.
```text
In Amn a debt is named and sealed,
Then lessened by a kinder hand,
Shieldmeet shows how wounds are healed,
When mercy learns to understand.
```

10.
```text
Calimshan elders lift their gaze,
And name the line that now must stand,
Shieldmeet sets the coming days,
By choosing trust instead of sand.
```

11.
```text
In Tethyr farmers and the crown,
Renew the pact that binds the road,
Shieldmeet weighs the up and down,
Of land that feeds and laws that load.
```

12.
```text
At Baldur's Gate the bells ring low,
As rival voices take their turn,
Shieldmeet lets the people know,
What must be faced, not simply burned.
```

13.
```text
In Saltmarsh elders mark the day,
With chalk upon the hall's old beam,
Shieldmeet asks the town to say,
What future fits the shared-up dream.
```

14.
```text
Promises once bent are straight,
Or broken clean before the crowd,
Shieldmeet closes every gate,
To half-spoke vows and voices loud.
```

15.
```text
On Waterdeep's long marble floor,
The city's code is read aloud,
Shieldmeet proves the law is more,
Than symbols worn or titles bowed.
```

16.
```text
In Amn the guilds renew their trust,
By opening books to public eye,
Shieldmeet counts the fair and just,
And lets the hidden margins die.
```

17.
```text
Calimshan pauses song and spice,
To hear the verdict's final shape,
Shieldmeet makes the careful choice,
That cuts a clean and lasting drape.
```

18.
```text
In Tethyr courts sit open-wide,
No door is shut, no voice denied,
Shieldmeet asks what we will hide,
When nothing can be set aside.
```

19.
```text
At Baldur's Gate the river waits,
As judgments fall like measured stone,
Shieldmeet opens heavier gates,
By making every reason known.
```

20.
```text
In Saltmarsh the crowd breaks into pairs,
Debating still what must be done,
Shieldmeet leaves the air with cares,
But binds them all beneath one sun.
```

21.
```text
A bell rings once, the crowd replies,
Not with a cheer, but steady sound,
Shieldmeet meets the watching eyes,
And keeps the city tightly bound.
```

22.
```text
On Waterdeep's high tower stair,
The watch resets its oath and seal,
Shieldmeet makes the promise fair,
By making all the burden real.
```

23.
```text
In Amn the poor are named in law,
Not as a line but living claim,
Shieldmeet shows what justice saw,
When mercy learned to spell its name.
```

24.
```text
Calimshan weighs the elder's word,
Against the market's restless need,
Shieldmeet listens, undeterred,
And plants the future like a seed.
```

25.
```text
In Tethyr banners do not wave,
Until the final oath is sworn,
Shieldmeet keeps the vows we gave,
And marks the year the law was born.
```

26.
```text
At Baldur's Gate the bells fall mute,
As silence seals the chosen path,
Shieldmeet calls for firm resolve,
Not easy peace or hurried wrath.
```

27.
```text
In Saltmarsh votes are counted slow,
By lifted hand and careful eye,
Shieldmeet trusts the gathered know,
What future asks and won't deny.
```

28.
```text
A vow once broken, named, and healed,
Is set back true before the crowd,
Shieldmeet binds what was concealed,
And makes the spoken promise loud.
```

29.
```text
On Waterdeep's broad civic stone,
The crowd disperses, changed but whole,
Shieldmeet weighs the city's tone,
And writes it in the public soul.
```

30.
```text
In Amn the ink is dried and kept,
No flourish hides the final line,
Shieldmeet guards the promise swept,
From greed's more tempting, crooked sign.
```

31.
```text
Calimshan names the ruling line,
Without a shout or gilded show,
Shieldmeet draws the final sign,
That all the people come to know.
```

32.
```text
In Tethyr oaths are sworn at dawn,
Not to a king, but law itself,
Shieldmeet says the work's begun,
When duty outlives crown and self.
```

33.
```text
At Baldur's Gate the river flows,
Unmoved by word or chosen claim,
Shieldmeet leaves the choice exposed,
And asks the city earn its name.
```

34.
```text
In Saltmarsh trade resumes at noon,
But something steadier remains,
Shieldmeet fades, but leaves a tune,
Of trust that holds through calmer gains.
```

35.
```text
Justice walks without a sword,
Through streets now marked by spoken vow,
Shieldmeet sets the binding word,
And asks us all to keep it now.
```

36.
```text
The bells ring once, the crowd stands fast,
As words are weighed against the past,
Shieldmeet calls the people near,
To choose the law they all must bear.
```

##### `quips.festival.shieldmeet.short` (46 entries)

1.
```text
Waterdeep swears beneath clear sky,
Shieldmeet lets old promises lie.
```

2.
```text
Amnian banners lift and stay,
Shieldmeet weighs the words we say.
```

3.
```text
Calimshan courts stand judged and seen,
Shieldmeet sharpens what we mean.
```

4.
```text
Tethyr renews its vows in light,
Shieldmeet binds the law to right.
```

5.
```text
At Baldur's Gate the bells ring true,
Shieldmeet asks what we will do.
```

6.
```text
Saltmarsh gathers, voice to voice,
Shieldmeet crowns the common choice.
```

7.
```text
Oaths are spoken, hands are shown,
Shieldmeet claims what's clearly known.
```

8.
```text
No feast outruns the words once said,
Shieldmeet counts the living dead.
```

9.
```text
A charter signed, a seal impressed,
Shieldmeet tests the town's good faith.
```

10.
```text
Justice walks the open square,
Shieldmeet leaves no seat unfair.
```

11.
```text
Amn sets scales in even line,
Shieldmeet draws the border fine.
```

12.
```text
Calimshan pauses song and drum,
Shieldmeet asks what we've become.
```

13.
```text
Tethyr's lords and farmers meet,
Shieldmeet keeps the ground beneath.
```

14.
```text
At Baldur's Gate the crowd stands still,
Shieldmeet weighs the public will.
```

15.
```text
Saltmarsh nets are laid aside,
Shieldmeet hears the inward tide.
```

16.
```text
A vow once bent is spoken straight,
Shieldmeet closes every gate.
```

17.
```text
Law replaces crown and blade,
Shieldmeet asks how trust is made.
```

18.
```text
The bell rings once, the crowd replies,
Shieldmeet meets the watching eyes.
```

19.
```text
Promises count more than gold,
Shieldmeet likes the plainly told.
```

20.
```text
Amnian ink runs dark and slow,
Shieldmeet signs what all must know.
```

21.
```text
Calimshan judges lift their hand,
Shieldmeet names the chosen stand.
```

22.
```text
Tethyr's banners do not wave,
Shieldmeet keeps the oaths we gave.
```

23.
```text
At Baldur's Gate the river waits,
Shieldmeet opens heavier gates.
```

24.
```text
Saltmarsh listens, then agrees,
Shieldmeet speaks in careful seas.
```

25.
```text
Truth is called and must appear,
Shieldmeet keeps the meaning clear.
```

26.
```text
No drum is louder than the law,
Shieldmeet shows us what we saw.
```

27.
```text
Amn forgives, but writes it down,
Shieldmeet guards the fragile crown.
```

28.
```text
Calimshan weighs the elder's word,
Shieldmeet listens, undeterred.
```

29.
```text
Tethyr binds the road and field,
Shieldmeet shows what vows can yield.
```

30.
```text
At Baldur's Gate the crowd divides,
Shieldmeet hears both stubborn sides.
```

31.
```text
Saltmarsh votes with lifted hand,
Shieldmeet trusts the gathered land.
```

32.
```text
Old wrongs named without disguise,
Shieldmeet meets them eye to eyes.
```

33.
```text
Justice speaks without a sword,
Shieldmeet sets the binding word.
```

34.
```text
Amnian guilds renew their trust,
Shieldmeet counts the fair and just.
```

35.
```text
Calimshan seals a careful pact,
Shieldmeet asks what comes of act.
```

36.
```text
Tethyr's courts sit open-wide,
Shieldmeet leaves no place to hide.
```

37.
```text
At Baldur's Gate the bells fall mute,
Shieldmeet calls for firm resolve.
```

38.
```text
Saltmarsh elders mark the day,
Shieldmeet lets the people say.
```

39.
```text
A vow once broken, named, and healed,
Shieldmeet binds what was concealed.
```

40.
```text
The crowd disperses, changed but whole,
Shieldmeet weighs the civic soul.
```

41.
```text
Amn writes peace in measured hand,
Shieldmeet steadies shifting land.
```

42.
```text
Calimshan names the ruling line,
Shieldmeet draws the final sign.
```

43.
```text
Tethyr swears before the sun,
Shieldmeet says the work's begun.
```

44.
```text
At Baldur's Gate the river flows,
Shieldmeet leaves the choice exposed.
```

45.
```text
Saltmarsh turns back to its trade,
Shieldmeet keeps the oath it made.
```

46.
```text
Oaths are spoken, crowds stand still,
Shieldmeet binds the common will.
```

#### `uktar`

##### `quips.festival.uktar.long` (1 entries)

1.
```text
On Waterdeep's streets the leaves decay,
And cling like paste to stone and boot,
Uktar reminds us day by day,
That endings feed the waiting root,
The city smells of dampened stone,
Of cellars sealed and windows tight,
The year begins to stand alone,
And practice being swallowed night.
```

##### `quips.festival.uktar.medium` (5 entries)

1.
```text
On Waterdeep's streets the leaves decay,
And cling like paste to stone and boot,
Uktar reminds us day by day,
That endings feed the waiting root.
```

2.
```text
In Amn the stores are checked again,
For mold, for damp, for creeping loss,
Uktar teaches mortal men,
To count what rots as part of cost.
```

3.
```text
In Calimshan the spice turns sharp,
As heat gives way to creeping chill,
Uktar quiets song and harp,
And teaches stillness, not the thrill.
```

4.
```text
In Tethyr woods the leaf-mold spreads,
Softening paths once hard and sure,
Uktar bows the antlered heads,
And makes the wounded earth endure.
```

5.
```text
At Baldur's Gate the fog runs thick,
And swallows bell and harbor cry,
Uktar makes the daylight sick,
And drags the year's last warmth to die.
```

##### `quips.festival.uktar.short` (47 entries)

1.
```text
Leaves rot deep in Waterdeep stone,
Uktar reminds us all things moan.
```

2.
```text
Amnian fields lie dark and bare,
Uktar teaches careful care.
```

3.
```text
Calimshan smells of spice and rot,
Uktar counts what time forgot.
```

4.
```text
Tethyr's woods go soft and brown,
Uktar pulls the green world down.
```

5.
```text
At Baldur's Gate the fog stays low,
Uktar slows the outward flow.
```

6.
```text
Saltmarsh mud grips boot and oar,
Uktar closes one more door.
```

7.
```text
Fruit falls black before it's sweet,
Uktar keeps no harvest neat.
```

8.
```text
Cold creeps in through rotting grain,
Uktar weighs the year's last pain.
```

9.
```text
Mushrooms bloom where leaves have died,
Uktar walks the hidden side.
```

10.
```text
Smoke smells sharp with damp decay,
Uktar eats the light away.
```

11.
```text
Amn locks stores against the mold,
Uktar tests the strong and old.
```

12.
```text
Calimshan buries summer's boast,
Uktar favors ghost and ghost.
```

13.
```text
Tethyr's roads turn slick and slow,
Uktar makes the cart wheels groan.
```

14.
```text
At Baldur's Gate the river dulls,
Uktar thickens trade and skulls.
```

15.
```text
Saltmarsh nets come up in slime,
Uktar laughs at wasted time.
```

16.
```text
Worm and root and creeping thing,
Uktar crowns the unseen king.
```

17.
```text
Leaves stick fast to traveler's feet,
Uktar breaks the walking beat.
```

18.
```text
Cellars smell of dampened hope,
Uktar tightens winter's rope.
```

19.
```text
Amn counts loss before the frost,
Uktar names what must be lost.
```

20.
```text
Calimshan spice turns sharp and thin,
Uktar lets the cold creep in.
```

21.
```text
Tethyr's cattle breathe out steam,
Uktar chills the pastoral dream.
```

22.
```text
At Baldur's Gate the bells ring rare,
Uktar thickens city air.
```

23.
```text
Saltmarsh fog eats sound and sight,
Uktar owns the edge of night.
```

24.
```text
Rot feeds root beneath the soil,
Uktar pays the unseen toil.
```

25.
```text
Fruit flies dance where wine went bad,
Uktar keeps no memory glad.
```

26.
```text
Amn seals grain with pitch and tar,
Uktar dims the rising star.
```

27.
```text
Calimshan fires burn more low,
Uktar teaches less to show.
```

28.
```text
Tethyr's leaves collapse to paste,
Uktar hates no honest waste.
```

29.
```text
At Baldur's Gate the docks run slick,
Uktar makes the footing thick.
```

30.
```text
Saltmarsh gulls cry hoarse and slow,
Uktar keeps the tides below.
```

31.
```text
Roots break stone in quiet time,
Uktar works without a rhyme.
```

32.
```text
Mold writes maps on cellar wall,
Uktar waits for winter's call.
```

33.
```text
Amn prepares for months of lean,
Uktar wipes the slate between.
```

34.
```text
Calimshan hides the summer shine,
Uktar bends the southern line.
```

35.
```text
Tethyr's hunters walk more slow,
Uktar tracks the wounded doe.
```

36.
```text
At Baldur's Gate the nights feel long,
Uktar hums a dying song.
```

37.
```text
Saltmarsh boats sit black and still,
Uktar drains the sailor's will.
```

38.
```text
The year exhales its final breath,
Uktar practices for death.
```

39.
```text
Rot and growth are kin and kin,
Uktar marks where both begin.
```

40.
```text
Amn endures the damp and cold,
Uktar tests the bought and sold.
```

41.
```text
Calimshan counts the spoiling store,
Uktar asks for something more.
```

42.
```text
Tethyr's soil turns dark as ink,
Uktar makes the future sink.
```

43.
```text
At Baldur's Gate the fog won't break,
Uktar keeps us half-awake.
```

44.
```text
Saltmarsh smells of weed and brine,
Uktar blurs the mortal line.
```

45.
```text
A final leaf lets go and falls,
Uktar closes year-long halls.
```

46.
```text
Decay is not the end we fear,
Uktar clears the ground for year.
```

47.
```text
Rot settles in where warmth once lay,
Uktar clears the year away.
```

### Season Pools

#### `autumn`

##### `quips.season.autumn.long` (20 entries)

1.
```text
The leaves trade green for copper hush,
They drift like thoughts the year forgot,
Autumn teaches how to rush,
By slowing down what summer sought,
The wind smells peat and distant rain,
It hums a low, unhurried strain,
Autumn weighs the loss and gain,
And keeps what time would not retain.
```

2.
```text
A cooler breeze walks down the quay,
It tests the lantern's steadier flame,
Autumn asks the sea to be,
Less bright, but truer all the same,
The sun steps back from summer's boast,
It leaves the sky in tempered glow,
Autumn knows what matters most,
By letting lighter moments go.
```

3.
```text
The bell rings low at earlier dusk,
Its sound is thick with thinning light,
Autumn sheds the bright and brusque,
And settles into longer night,
A market folds its noisy cloth,
It counts its coins and counts its cheer,
Autumn teaches what is worth,
Keeping close when cold draws near.
```

4.
```text
The harbor smells of smoke and skin,
Of apples stored and fires made,
Autumn draws the season in,
And learns the worth of every shade,
Casks grow warm with quiet song,
They keep the laughter in their wood,
Autumn shows where we belong,
By sharing heat the way we should.
```

5.
```text
A crow repeats the day's last news,
It speaks of fields and fallen plans,
Autumn listens, then reviews,
What must be held in careful hands,
Leaves pile deep where corners meet,
They barter noise for softer tread,
Autumn makes the footfalls sweet,
And cushions all the words we said.
```

6.
```text
The tide returns with quieter feet,
It drags the dark along the shore,
Autumn lets the endings meet,
And asks the heart to ask once more,
What stayed when brighter days went past,
What holds when warmth has walked away,
Autumn teaches how to last,
By choosing less to spend each day.
```

7.
```text
A lantern glows with practiced flame,
It wastes no light on empty air,
Autumn learns the honest name,
Of warmth that knows it must be spare,
The fire speaks in calmer tone,
It warms the bones, not just the room,
Autumn makes the hearth feel home,
By lighting night before the gloom.
```

8.
```text
The dock cat trades the sun for stone,
It curls where heat still lingers faint,
Autumn claims the warmth alone,
That summer left without complaint,
A window fogs at early hours,
It keeps the glow like pressed-down flowers,
Autumn guards the borrowed powers,
That help the tired heart endure.
```

9.
```text
The air tastes thin with coming frost,
It sharpens thought and spoken sound,
Autumn counts the warmth we lost,
And measures what is still around,
Words grow fewer, truer, clean,
They fall like leaves in patient choice,
Autumn strips the lies between,
And leaves the core of every voice.
```

10.
```text
A shutter closes without fear,
It knows the night will soon arrive,
Autumn makes the reason clear,
For sealing tight so hearths survive,
The wind will pry at every seam,
It tests the nail and weathered frame,
Autumn turns shelter into theme,
And keeps the household in its name.
```

11.
```text
The leaves write letters none can read,
They sign them all with falling speed,
Autumn keeps the quiet creed,
That endings plant a deeper seed,
The ground receives without a fuss,
It knows the gift that drifted down,
Autumn teaches this to us,
By dressing earth in rusted brown.
```

12.
```text
The sun keeps shorter counts of day,
It spends the rest in copper glow,
Autumn finds a gentler way,
To let the light be less, not low,
Evening comes with softer feet,
It does not slam the door of sky,
Autumn makes the moment sweet,
By letting brightness learn to die.
```

13.
```text
The market quiets, crate by crate,
It folds its noise and counts its store,
Autumn knows the worth of wait,
And what each careful silence swore,
Apples scent the cooler air,
Bread and spice and drying thyme,
Autumn makes the table fair,
By turning hunger into time.
```

14.
```text
A rope grows rough beneath the palm,
It keeps the marks of worked-out days,
Autumn trades the sudden calm,
For steadier, more patient ways,
The knots are tied with slower breath,
Each turn a promise to be true,
Autumn teaches strength in depth,
By showing what the hands can do.
```

15.
```text
The dock boards creak with older tales,
They've learned the weight of slower gales,
Autumn listens where it fails,
And reads the truth in softer scales,
Wood remembers boots and rain,
Salt and laughter, loss and cheer,
Autumn writes the steadier strain,
That holds a town from year to year.
```

16.
```text
The wind smells grain and distant rain,
It brings the fields their closing song,
Autumn trades the bright refrain,
For notes that say where things belong,
Scarecrows watch with patient eyes,
They stand where summer used to run,
Autumn teaches how the wise,
Let go before the work is done.
```

17.
```text
A boat comes in with careful sound,
It knows the seas have changed their mind,
Autumn turns the world around,
And asks the brave to read the sign,
The harbor hums a deeper tone,
It welcomes hulls with quieter pride,
Autumn shows the truth is known,
When sailors choose to come inside.
```

18.
```text
The bell rings clear despite the chill,
It holds its note against the air,
Autumn proves the iron will,
That stays when lighter sounds might tear,
Each toll reminds the town to mend,
To settle debts and close the day,
Autumn teaches how to end,
Without pretending to decay.
```

19.
```text
The tide pulls tight its silver thread,
It knots the months the summer shed,
Autumn reads what tides have said,
And leaves the rest to go unsaid,
The shore grows bare, then dressed again,
In wrack and leaf and drifted reed,
Autumn teaches change in plain,
By showing what the water needs.
```

20.
```text
A leaf sticks fast to every boot,
It wants the town to share its route,
Autumn proves that wandering root,
Can still arrive where plans take fruit,
The streets grow soft with fallen gold,
They hush the haste of hurried feet,
Autumn makes the story told,
By turning noise to measured beat.
```

##### `quips.season.autumn.medium` (47 entries)

1.
```text
The leaves trade green for copper hush,
They drift like thoughts the year forgot,
Autumn teaches how to rush,
By slowing down what summer sought.
```

2.
```text
A cooler wind counts bins of grain,
It hums along the market rows,
Autumn weighs the loss and gain,
And keeps the books that harvest knows.
```

3.
```text
The bell rings low at earlier dusk,
Its sound is thick with ending light,
Autumn sheds the bright and brusque,
And settles into longer night.
```

4.
```text
The harbor smells of smoke and skin,
Of apples stored and fires made,
Autumn draws the season in,
And learns the worth of every shade.
```

5.
```text
A crow repeats the day's last news,
It speaks of fields and fallen plans,
Autumn listens, then reviews,
What must be kept in careful hands.
```

6.
```text
The sun steps back from summer's boast,
It leaves the sky in tempered flame,
Autumn teaches what we lost,
And lets the cooling teach the same.
```

7.
```text
A rope grows rough beneath the palm,
It keeps the marks of worked-out days,
Autumn trades the sudden calm,
For steadier, more patient ways.
```

8.
```text
The tide returns with quieter feet,
It drags the dark along the quay,
Autumn makes the meeting meet,
Between what was and what will be.
```

9.
```text
A lantern glows with practiced flame,
It wastes no light on empty air,
Autumn learns the honest name,
Of warmth that knows it must be spare.
```

10.
```text
The dockcat trades the sun for stone,
It curls where heat still lingers faint,
Autumn claims the warmth alone,
That summer left without complaint.
```

11.
```text
The air tastes thin with coming frost,
It sharpens thought and spoken sound,
Autumn counts the warmth we lost,
And measures what is still around.
```

12.
```text
A shutter closes without fear,
It knows the night will soon arrive,
Autumn makes the reason clear,
For sealing tight so hearths survive.
```

13.
```text
The leaves pile deep where corners meet,
They trade their noise for softer tread,
Autumn teaches how the feet,
May walk where brighter days have fled.
```

14.
```text
The bell rings once, then holds its breath,
As if to mark the year's slow turn,
Autumn names the shape of death,
By showing how the fires burn.
```

15.
```text
A boat comes in with careful sound,
It knows the seas have changed their mind,
Autumn turns the world around,
And asks the brave to read the sign.
```

16.
```text
The sun keeps shorter accounts of day,
It spends the rest in copper glow,
Autumn learns the art of way,
By letting lighter moments go.
```

17.
```text
The wind smells peat and distant rain,
It brings the fields their closing song,
Autumn trades the bright refrain,
For notes that say where things belong.
```

18.
```text
A kettle waits with patient heat,
It knows the night will ask for more,
Autumn teaches hands to meet,
Around the hearth they've known before.
```

19.
```text
The harbor hums a deeper tone,
Its sounds grow thick with gathered years,
Autumn makes the weight be known,
Of work remembered through the cheers.
```

20.
```text
A crow grows quiet near the end,
It saves its voice for sharper need,
Autumn knows when not to spend,
The strength it took the year to seed.
```

21.
```text
The dock boards creak with older tales,
They've learned the weight of slower gales,
Autumn listens where it fails,
And writes the truth in softer scales.
```

22.
```text
A window fogs at early hours,
It keeps the warmth like pressed-down flowers,
Autumn shows the borrowed powers,
Of light that fades but still endures.
```

23.
```text
The tide pulls tight its silver thread,
It knots the months the summer shed,
Autumn reads what tides have said,
And leaves the rest to go unsaid.
```

24.
```text
The bell rings low with closing sound,
It knows the year has turned around,
Autumn finds the steady ground,
Where endings teach what starts have found.
```

25.
```text
A leaf sticks fast to every boot,
It wants the town to share its route,
Autumn proves that wandering root,
Can still arrive where plans take fruit.
```

26.
```text
The fire learns a calmer tone,
It warms the bones, not just the room,
Autumn trades the spark alone,
For heat that knows the coming gloom.
```

27.
```text
The harbor sleeps with tighter seams,
It dreams of ice and heavier dreams,
Autumn pulls the quiet beams,
That brace the dark at midnight's schemes.
```

28.
```text
A rope coils neat without a word,
It waits the weight it soon will hear,
Autumn keeps the truth deferred,
Until the need is sharp and clear.
```

29.
```text
The sun burns red at day's last glance,
It bows before the lengthened night,
Autumn learns the patient dance,
Of fading slow instead of slight.
```

30.
```text
The air grows sharp at close of day,
It cuts the talk down to the bone,
Autumn shows the honest way,
Of speaking less and meaning grown.
```

31.
```text
A lantern waits beside the door,
It knows what longer nights are for,
Autumn counts the hours more,
And teaches light to linger sore.
```

32.
```text
The market quiets, crate by crate,
It folds its noise and counts its store,
Autumn knows the worth of wait,
And what each careful silence swore.
```

33.
```text
The tide comes back with cooler breath,
It speaks in terms that favor depth,
Autumn draws the map of death,
And marks the roads that honor breadth.
```

34.
```text
A crow lifts off the paling field,
It carries dusk beneath its wing,
Autumn knows what must be sealed,
And what to darker seasons bring.
```

35.
```text
The bell rings clear despite the chill,
It holds its note against the air,
Autumn proves the iron will,
That stays when lighter sounds might tear.
```

36.
```text
The dockcat finds the warmest stone,
It claims the heat the sun has thrown,
Autumn teaches how the lone,
May still feel rich with what is known.
```

37.
```text
The leaves fall true to ancient plans,
They trust the soil more than hands,
Autumn shows what end still can,
Begin again in other lands.
```

38.
```text
The harbor breathes with steadier calm,
It trusts the weight of every hull,
Autumn trades the borrowed balm,
For truths that do not dull.
```

39.
```text
A window seals against the rain,
It keeps the glow the hearth has made,
Autumn learns the gentle strain,
Of warmth that must not be delayed.
```

40.
```text
The sun keeps less but gives it well,
It knows the art of farewell,
Autumn rings the closing bell,
And listens to the truth it tells.
```

41.
```text
A rope grows stiff with honest use,
It holds because it must and can,
Autumn cuts the final truce,
Between the year and careful man.
```

42.
```text
The street grows soft with fallen leaves,
It forgives the boots that pass,
Autumn trusts what earth believes,
And lets the noise turn into mass.
```

43.
```text
The wind counts days in thinning light,
It lets them go with gentler bite,
Autumn names the coming night,
Without pretending fear is right.
```

44.
```text
A lantern's glow turns inward now,
It warms the near, ignores the far,
Autumn shows us how and how,
To guard the small things that we are.
```

45.
```text
The harbor listens more than speaks,
It gathers tales from longer weeks,
Autumn keeps what silence seeks,
And learns the weight that quiet keeps.
```

46.
```text
A leaf spins down with final grace,
It lands without a mark or scar,
Autumn shows the gentle place,
Where endings rest the way they are.
```

47.
```text
The bell rings once, then lets it be,
It knows the sound has done its share,
Autumn sets the hours free,
And leaves them cooling in the air.
```

##### `quips.season.autumn.short` (48 entries)

1.
```text
The leaves keep counsel with the ground,
They tell it what the year has found.
```

2.
```text
A cooler wind counts debts of grain,
And asks the fields to pay in rain.
```

3.
```text
The sun steps back from summer's boast,
It leaves the day a thinner toast.
```

4.
```text
The harbor smells of smoke and skin,
As fires teach the dusk to grin.
```

5.
```text
A bell rings low with practiced care,
It knows the dark is waiting there.
```

6.
```text
The trees let go without a fight,
They trust the earth to set things right.
```

7.
```text
A market crate goes light and bare,
Its apples gone to everywhere.
```

8.
```text
The tide returns with quieter feet,
It brings the cold in salted sheets.
```

9.
```text
A crow repeats the news aloud,
That endings travel in a crowd.
```

10.
```text
The dockcat trades its stretch for curl,
It tucks the sun back in its fur.
```

11.
```text
The air tastes thin with coming frost,
It counts the warmth the summer lost.
```

12.
```text
A rope grows rough beneath the hand,
It's learned the truth of autumn's sand.
```

13.
```text
The bell rings once, then thinks it through,
As if the night were listening too.
```

14.
```text
A shutter learns to close in time,
It's done with light that stays past prime.
```

15.
```text
The leaves write letters none can read,
They sign them all with falling speed.
```

16.
```text
The fire learns a steadier tone,
It warms the bones, not just the stone.
```

17.
```text
A boat comes in with careful sound,
It knows the year is turning round.
```

18.
```text
The sun keeps short accounts of day,
It spends the rest in reddish gray.
```

19.
```text
The wind smells grain and distant rain,
It hums a low, unhurried strain.
```

20.
```text
A gull grows fat on slower seas,
It's learned the art of waiting fees.
```

21.
```text
The docks grow loud with stored-up cheer,
As casks admit the close of year.
```

22.
```text
A leaf sticks fast to every boot,
It wants the town to share its route.
```

23.
```text
The bell rings soft at early night,
Reluctant now to chase the light.
```

24.
```text
The tide pulls tight its silver thread,
It knots the months the summer shed.
```

25.
```text
A lantern glows with practiced flame,
It knows the dark but calls its name.
```

26.
```text
The street forgives the fallen leaves,
It knows what every season leaves.
```

27.
```text
The trees stand thin against the sky,
They've learned the grace of letting by.
```

28.
```text
A crow counts coins with clever eyes,
It trusts the shine of small supplies.
```

29.
```text
The air goes sharp at close of day,
As warmth prepares to walk away.
```

30.
```text
The dock boards creak with older tales,
They've learned the weight of slower gales.
```

31.
```text
A kettle waits with patient heat,
For hands that seek a steadier beat.
```

32.
```text
The sun burns red, then calls it done,
It hands the sky to colder sun.
```

33.
```text
A rope coils neat without a word,
It's ready now for what it heard.
```

34.
```text
The leaves pile up where corners meet,
They barter sound for softer feet.
```

35.
```text
The bell rings clear despite the chill,
It proves that iron has its will.
```

36.
```text
A fire remembers summer's face,
It keeps it close but not in place.
```

37.
```text
The harbor hums a deeper note,
It trusts the weight of every boat.
```

38.
```text
A crow grows quiet near the end,
It knows the dark is not a friend.
```

39.
```text
The wind counts days in thinning light,
It lets them go with gentler bite.
```

40.
```text
A window fogs at early hours,
It keeps the heat like fading flowers.
```

41.
```text
The tide comes back with cooler breath,
It speaks in terms that favor depth.
```

42.
```text
The dockcat trades the sun for stone,
It claims the warmth that lingers lone.
```

43.
```text
The bell rings low with closing sound,
It knows the year has turned around.
```

44.
```text
The leaves fall true to ancient plans,
They trust the soil more than hands.
```

45.
```text
A lantern waits beside the door,
It knows what longer nights are for.
```

46.
```text
The air smells peat and distant rain,
It hints at frost but won't complain.
```

47.
```text
The sun keeps less but gives it well,
It knows the art of saying farewell.
```

48.
```text
The harbor sleeps with tighter seams,
It dreams of ice and heavier dreams.
```

#### `spring`

##### `quips.season.spring.long` (20 entries)

1.
```text
The thaw unlocks the harbor's breath,
As ice releases timbered strain,
Spring argues gently against death,
And teaches loss how to remain,
Rain taps the dock with patient cheer,
It knocks like news that won't stay still,
Spring makes each whispered promise clear,
Then dares the heart to test its will.
```

2.
```text
The bell rings bright with lifted tone,
As if the cold has stepped aside,
Spring warms the sound to make it known,
That winter's grip has lost its pride,
New echoes travel farther now,
They trust the air to carry far,
Spring shows the how and teaches how,
To let the small things be what are.
```

3.
```text
A bud insists the dark was wrong,
It splits the soil with careful might,
Spring proves the small can still be strong,
And teaches ground to choose the light,
Roots loosen hands they clenched in fear,
They learn the art of letting go,
Spring makes the distant feel more near,
By growing slow instead of so.
```

4.
```text
The river laughs at broken ice,
It runs with unremembered ease,
Spring says that change can still be nice,
And frees the past with subtle pleas,
The current bends but does not break,
It trusts the shape the banks allow,
Spring shows the heart what it can take,
By yielding first and asking how.
```

5.
```text
Old knots relax in gentler air,
They yield the truths they tightly held,
Spring teaches rope another care,
And frees the hands it once compelled,
What bound us once begins to ease,
Without pretending work is done,
Spring keeps the scars but grants release,
And lets repair become the run.
```

6.
```text
The sun steps out with lighter shoes,
It lingers where it used to race,
Spring lets the day decide to choose,
A kinder, slower kind of pace,
Time stretches thin but does not tear,
It learns the worth of staying still,
Spring proves that rest is not despair,
But strength that bends to growing will.
```

7.
```text
The market hums with fresher sound,
As coins forget the weight of frost,
Spring turns the world a greener round,
And shrugs at warmth the cold had lost,
Trade opens hands instead of fists,
It risks the trust of being seen,
Spring counts the gain in hopeful lists,
Where need once kept the margins lean.
```

8.
```text
A window opens without fear,
It trusts the breeze that slips inside,
Spring makes the distant feel more near,
And gives the air a softer stride,
The house exhales a careful sigh,
It loosens walls that learned to brace,
Spring teaches shelter how to try,
A wider, more forgiving space.
```

9.
```text
The dockcat sheds its winter scowl,
It naps in light without disguise,
Spring trades the hunt for stretch and prowl,
And teaches fur to trust the skies,
Warm stone replaces guarded ground,
The body learns to rest again,
Spring writes the truce in shape and sound,
Between the now and what has been.
```

10.
```text
Rain writes new paths along the street,
It washes old mistakes away,
Spring learns that falling still can meet,
A ground prepared for what will stay,
Each drop repeats a gentler claim,
That change need not arrive with pain,
Spring cleans the slate but keeps the name,
Of lessons learned through loss and gain.
```

11.
```text
The bell rings twice for something new,
Then waits to see who answers fast,
Spring keeps the courage to pursue,
What winter warned would never last,
Hope answers not with shouted cheer,
But steps that dare to cross the line,
Spring proves the future can be near,
By choosing now instead of sign.
```

12.
```text
The soil sighs deep beneath the rain,
It opens hands it kept in fist,
Spring turns the ache of frozen strain,
Into a strength that can persist,
What lay asleep begins to stir,
It tests the dark before it grows,
Spring teaches patience to prefer,
The slower path the seedling knows.
```

13.
```text
A robin dares the open square,
It sings as if the world were fair,
Spring believes the song sincere,
And risks the truth by standing there,
The voice is small but clearly heard,
Against the stone and market din,
Spring proves the power of a word,
That chooses hope and enters in.
```

14.
```text
The river bends with easy will,
It lets the banks decide the way,
Spring teaches strength by learning still,
How yielding sometimes wins the day,
Force loosens when it learns to flow,
And pressure fades where trust appears,
Spring shows the heart what it can know,
By letting go of brittle fears.
```

15.
```text
New leaves rehearse an ancient plan,
To catch the light and let it pass,
Spring shows the best we ever can,
Is growing slow instead of fast,
Each vein remembers where it came,
It trusts the trunk to hold it true,
Spring keeps the promise in the same,
Old roots, new green, a broader view.
```

16.
```text
The fog lifts early from the quay,
It leaves the docks to test the blue,
Spring trades the veil for clarity,
And asks the eyes to follow through,
What hid the path now steps aside,
Without insisting it was wrong,
Spring proves the truth need not divide,
When sight returns both clear and strong.
```

17.
```text
A rope dries fast in warming sun,
It smells of hemp and second tries,
Spring knows the work is never done,
But lets the effort feel like prize,
The hands remember winter's ache,
Yet move with lighter practiced ease,
Spring teaches strength is not to break,
But bend and still accomplish these.
```

18.
```text
The bell rings clear with open sound,
It trusts the air to carry far,
Spring sets the notes upon the ground,
Then lifts them up to where we are,
What once fell flat now learns to rise,
Without the push of forced command,
Spring shows how meaning multiplies,
When shared by voice instead of hand.
```

19.
```text
A puddle keeps the sky too long,
It holds the clouds with playful greed,
Spring learns the joy of being wrong,
And spilling truth at gentle speed,
Reflection fades but leaves a trace,
A memory of borrowed blue,
Spring proves the art of leaving space,
For what will come and pass on through.
```

20.
```text
The harbor wakes with quieter pride,
It hums instead of shouting loud,
Spring shifts the weight the tides provide,
And wears the calm it's newly allowed,
Work resumes with tempered might,
No longer rushed by fear or frost,
Spring balances the dark and light,
And counts the gain without the cost.
```

##### `quips.season.spring.medium` (46 entries)

1.
```text
The thaw unlocks the harbor's breath,
As ropes remember how to bend,
Spring argues softly against death,
And teaches ice how things can end.
```

2.
```text
Rain taps the dock with careful cheer,
It knocks like news that won't stay still,
Spring makes each whispered promise clear,
Then dares the heart to trust its will.
```

3.
```text
The bell rings bright with lifted tone,
As if the cold has stepped aside,
Spring warms the sound to make it known,
That winter's grip has slipped its pride.
```

4.
```text
A bud insists the dark was wrong,
It splits the soil with patient might,
Spring proves the small can still be strong,
And teach the ground to choose the light.
```

5.
```text
The river laughs at broken ice,
It runs more freely than before,
Spring says that change can still be nice,
And finds a door in every door.
```

6.
```text
Old knots relax in gentler air,
They yield the truth they tightly held,
Spring shows the rope another care,
And frees the hands it once compelled.
```

7.
```text
The sun steps out with lighter shoes,
It lingers where it used to race,
Spring lets the day decide to choose,
A slower, kinder kind of pace.
```

8.
```text
The market hums with fresher sound,
As coins forget the weight of frost,
Spring turns the world a greener round,
And shrugs at all the warmth it lost.
```

9.
```text
A window opens without fear,
It trusts the breeze that slips inside,
Spring makes the distant seem more near,
And gives the air a softer stride.
```

10.
```text
The dockcat sheds its winter scowl,
It naps in light without disguise,
Spring trades the hunt for stretch and prowl,
And teaches fur to trust the skies.
```

11.
```text
Rain writes new paths along the street,
It washes old mistakes away,
Spring learns that falling still can meet,
A ground prepared for what will stay.
```

12.
```text
The bell rings twice for something new,
Then waits to see who answers fast,
Spring keeps the courage to pursue,
What winter warned would never last.
```

13.
```text
The soil sighs deep beneath the rain,
It opens hands it kept in fist,
Spring turns the ache of frozen strain,
Into a hope that can persist.
```

14.
```text
A robin dares the open square,
It sings as if the world were fair,
Spring believes the song sincere,
And risks the truth by standing there.
```

15.
```text
The river bends with easy will,
It lets the banks decide the way,
Spring teaches strength by learning still,
How yielding sometimes wins the day.
```

16.
```text
New leaves rehearse an ancient plan,
To catch the light and let it pass,
Spring shows the best we ever can,
Is growing slow instead of fast.
```

17.
```text
The fog lifts early from the quay,
It leaves the docks to test the blue,
Spring trades the veil for clarity,
And asks the eyes to follow through.
```

18.
```text
A rope dries fast in warming sun,
It smells of hemp and second tries,
Spring knows that work is never done,
But lets the effort feel like prize.
```

19.
```text
The bell rings clear with open sound,
It trusts the air to carry far,
Spring sets the notes upon the ground,
Then lifts them up to where we are.
```

20.
```text
A puddle keeps the sky too long,
It holds the clouds with playful greed,
Spring learns the joy of being wrong,
And spilling truth at gentle speed.
```

21.
```text
The harbor wakes with quieter pride,
It hums instead of shouting loud,
Spring shifts the weight the tides provide,
And wears the calm it's newly allowed.
```

22.
```text
A seed remembers how to start,
It breaks the dark without a shout,
Spring proves that patience has a heart,
And finds a way from in to out.
```

23.
```text
The sun counts hours more at play,
It spends them freely on the street,
Spring teaches time to gently stay,
Instead of racing toward defeat.
```

24.
```text
The wind smells green and distant rain,
It brings the news the fields have sent,
Spring trades the ache of frozen pain,
For breath that knows what it has meant.
```

25.
```text
A shutter opens inch by inch,
It tests the warmth with careful eye,
Spring does not rush the timid flinch,
But waits until the fear slips by.
```

26.
```text
The river shines with broken light,
It wears the sky in moving bands,
Spring turns reflection into sight,
And writes its truth in shifting sands.
```

27.
```text
The bell rings once, then once again,
As if to practice being heard,
Spring makes the quiet speak, and then,
Gives weight to every spoken word.
```

28.
```text
A cat discovers sunny stone,
It claims the heat with easy grace,
Spring teaches comfort to be known,
As something earned by staying place.
```

29.
```text
The rain forgives the dusty road,
It smooths the cracks the frost had made,
Spring lifts the world from winter's load,
And pays the debt that cold delayed.
```

30.
```text
The market smells of bread and green,
Of herbs that dare to show their face,
Spring learns how hunger might be seen,
As hope instead of base disgrace.
```

31.
```text
A window fogs, then clears its view,
It learns the trick of letting go,
Spring shows the heart what it can do,
By losing what it used to know.
```

32.
```text
The dock boards creak with lighter sound,
They flex beneath returning feet,
Spring finds the joy of being bound,
To paths that choose to gently meet.
```

33.
```text
The sun stays late without a boast,
It shares the warmth it used to save,
Spring shows the most by giving most,
And trusts the gift it dares to give.
```

34.
```text
A rope lies loose beside the rail,
It rests before the work begins,
Spring teaches pause can still prevail,
Before the season's labor wins.
```

35.
```text
The river hums a hopeful tune,
It sings of miles yet to be crossed,
Spring trades the ache of ending soon,
For faith that nothing true is lost.
```

36.
```text
The bell rings soft in warming air,
It listens for a gentler sound,
Spring sets the note with mindful care,
And lets it travel close to ground.
```

37.
```text
A leaf unfolds with careful speed,
It trusts the sun but tests the breeze,
Spring proves that courage starts in need,
And grows through small uncertainties.
```

38.
```text
The harbor breathes in deeper time,
It stretches free of winter's seam,
Spring writes the world a newer rhyme,
And lets the waking feel like dream.
```

39.
```text
The rain steps back to let the light,
It knows when not to overstay,
Spring balances the dark and bright,
And keeps the edges in their play.
```

40.
```text
A bird repeats a simple phrase,
As if it might improve the day,
Spring trusts that truth is what it says,
When sung enough to find its way.
```

41.
```text
The street grows loud with opened doors,
It hums with feet that choose to roam,
Spring trades the hush of closed-in hours,
For risk that feels a lot like home.
```

42.
```text
The sun warms hands that once were numb,
It teaches touch to feel again,
Spring knows the thaw has truly come,
When pain can pass for warmth, not pain.
```

43.
```text
The bell rings clear with lifted sound,
It marks the turning without fear,
Spring knows the year has come around,
And dares us all to stay right here.
```

44.
```text
A rope is mended, clean and tight,
It waits its turn without complaint,
Spring proves repair is not the fight,
But choosing to remain unbroken.
```

45.
```text
The harbor smiles in shifting light,
It learns to trust the changing tide,
Spring trades the cold's unyielding night,
For days that open wide and wide.
```

46.
```text
A seed breaks free from what it knew,
It risks the air without a plan,
Spring shows what hope is brave enough to do,
When roots release the former land.
```

##### `quips.season.spring.short` (49 entries)

1.
```text
The thaw knocks softly on the door,
And winter learns it owns no more.
```

2.
```text
New grass rehearses how to grow,
It starts in whispers, then says so.
```

3.
```text
The rain arrives without a grudge,
It cleans the street of winter's sludge.
```

4.
```text
A bud believes the sun's a friend,
It trusts the warmth will not pretend.
```

5.
```text
The river laughs at broken ice,
It's learned that change can still be nice.
```

6.
```text
Old paths wake up with muddy feet,
They stretch and yawn at springtime's beat.
```

7.
```text
The bell rings bright with loosened tone,
As if the cold has let it go.
```

8.
```text
A breeze tests leaves like fragile sails,
It learns which hopes will not turn pale.
```

9.
```text
The soil keeps secrets dark and deep,
Then spends them all in sudden sleep.
```

10.
```text
A bird repeats the same small lie:
That songs are easy, free, and dry.
```

11.
```text
The dock smells new despite its age,
The thaw has turned another page.
```

12.
```text
A puddle holds the sky too long,
Then drops it back where it belongs.
```

13.
```text
The sun steps out in lighter shoes,
And finds the courage to amuse.
```

14.
```text
New ropes feel strange in warming hands,
They've yet to learn the sea's demands.
```

15.
```text
The rain taps time along the rail,
Each note a promise, thin but hale.
```

16.
```text
A cat forgets its winter scowl,
It naps through noon, content to prowl.
```

17.
```text
The wind brings news from further green,
Of places thawed and yet unseen.
```

18.
```text
A seed remembers how to start,
It breaks the dark with patient heart.
```

19.
```text
The market hums a brighter tune,
Coins change their minds by afternoon.
```

20.
```text
A thawed-out knot comes loose with grace,
It leaves no mark of winter's face.
```

21.
```text
The river runs with lighter load,
It shrugs off ice and finds the road.
```

22.
```text
Fresh paint still smells of careful cheer,
It dares the eye to linger near.
```

23.
```text
The bell rings twice for something new,
The third ring's left for what comes through.
```

24.
```text
A sprig of green between the
stones Explains the world in hopeful tones.
```

25.
```text
The fog lifts early, thin and shy,
It lets the rooftops test the sky.
```

26.
```text
A shovel rests against the wall,
It knows its reign was not for all.
```

27.
```text
The sun counts hours more at play,
It's less inclined to rush away.
```

28.
```text
A boat rocks free from icy care,
It tastes the dock, then freshened air.
```

29.
```text
The ground forgives the winter's weight,
It rises slow, but won't be late.
```

30.
```text
A robin dares the open square,
It sings as if the world were fair.
```

31.
```text
The thaw unbuttons every lane,
It lets the boots complain of rain.
```

32.
```text
The river bends with softened will,
It's learned that ice can't argue still.
```

33.
```text
A window opens without fear,
It trusts the cold has lost its year.
```

34.
```text
The dockcat sheds its heavy doubt,
And tests the sun by stretching out.
```

35.
```text
New leaves repeat an ancient plan,
To make more green than winter can.
```

36.
```text
The rain keeps time with gentler hands,
It smooths the cracks it understands.
```

37.
```text
A bell rings clear with higher aim,
It knows the air has changed its name.
```

38.
```text
The wind smells earth and growing things,
It hums along on loosened strings.
```

39.
```text
A rope dries fast in lengthened light,
It's learned to trust the day, not night.
```

40.
```text
The soil sighs once, then splits in two,
To let a small green truth come through.
```

41.
```text
The harbor wakes with quieter pride,
It's done pretending it won't tide.
```

42.
```text
A thawed coin feels less hard and cold,
As if its worth has learned to fold.
```

43.
```text
The sun steps back from winter's claim,
And leaves the door ajar to flame.
```

44.
```text
The street learns mud is not a sin,
It means the world is moving in.
```

45.
```text
A gull forgets its starving cries,
It learns to laugh at clearer skies.
```

46.
```text
The rain stops short, as if to say,
You'll walk alone the rest of the way.
```

47.
```text
The bells ring on with lifted sound,
They like the air that's gone unbound.
```

48.
```text
The earth keeps turning, soft but sure,
It knows that growth is never pure.
```

49.
```text
A bud breaks rules it never read,
It grows because the cold has fled.
```

#### `summer`

##### `quips.season.summer.long` (20 entries)

1.
```text
The sun stays late above the quay,
It listens close to water talk,
Summer lets the daylight wander free,
And slows the pace of every walk,
Warm boards remember bare feet's trace,
They hold the heat the hours gave,
Summer teaches time its place,
By letting moments misbehave.
```

2.
```text
A bell rings thin in heated air,
It sweats like hands that will not rest,
Summer trusts the sound to linger there,
Long after shade has done its best,
Echoes stretch with lazy grace,
They drift where clocks refuse to go,
Summer learns the art of space,
By letting every second grow.
```

3.
```text
The tide rolls in with golden skin,
It glimmers secrets into sand,
Summer keeps the hours warm within,
And leaves them open, uncommanded,
Reflections break and mend again,
As sky and shoreline change their tone,
Summer shows the world how then,
Becomes the now we call our own.
```

4.
```text
Bare feet learn docks by grain and scar,
They count the planks by heat and sound,
Summer teaches pain is not so far,
From laughter when the light is found,
Each step remembers where it lands,
Yet dares to wander all the same,
Summer trusts the honest hands,
That learn by touch and never shame.
```

5.
```text
The harbor smells of pitch and tar,
And something sweet that drifts nearby,
Summer blends the near and far,
Until the days forget to hurry by,
Work and rest begin to meet,
They trade their lines with easy ease,
Summer teaches how to greet,
The long, unbroken afternoons.
```

6.
```text
A sail snaps white against the blue,
It argues gently with the breeze,
Summer trusts the wind to see it through,
And lets the effort move with ease,
The canvas learns the sky's reply,
It bends but does not lose its aim,
Summer shows the reason why,
To yield is not to quit the game.
```

7.
```text
The market hums in open sound,
Coins click bright on open palm,
Summer spreads the voices round,
And trades the rush for lingering calm,
Time is spent like minted gold,
With laughter stamped on every face,
Summer keeps the stories told,
By letting joy set its own pace.
```

8.
```text
A pitcher sweats beside the door,
It cools the hands that lift it fast,
Summer gives the body more,
Than memory will ever last,
The drink remembers shaded wells,
And lips that learned to wait their turn,
Summer teaches what it tells,
By letting thirst and kindness burn.
```

9.
```text
The sun writes long across the stone,
It spells the hours without shame,
Summer knows it's not alone,
In stretching time to fit its flame,
Shadows shrink but do not hide,
They linger where the light is fair,
Summer shows the gentler side,
Of days that dare to overcare.
```

10.
```text
The dockcat sleeps in fearless light,
It trusts the heat to guard its rest,
Summer teaches day and night,
Can share the same unbroken chest,
Dreams stretch long beneath the sun,
They wander free of winter's seam,
Summer proves the work is done,
When resting feels like earned routine.
```

11.
```text
A breeze steals salt from every tongue,
It tastes of days both bright and slow,
Summer knows when we are young,
By how we let the moments go,
Each breath recalls the open sea,
And laughter rides the warming air,
Summer teaches how to be,
By showing less is sometimes fair.
```

12.
```text
The bell rings once, then waits to hear,
If anyone will mind the call,
Summer learns the rule is clear,
Not every sound must rise or fall,
Silence joins the midday heat,
It rests beside the ringing tone,
Summer lets the quiet meet,
The noise we thought we needed known.
```

13.
```text
The tide leaves mirrors on the sand,
Where sky and footstep briefly meet,
Summer sets the world unplanned,
And lets reflection find its feet,
Images bend but do not break,
They fade as easily as they form,
Summer shows what we can take,
By watching change without alarm.
```

14.
```text
A rope dries fast in lengthened light,
It smells of hemp and honest work,
Summer turns the strain to slight,
And makes the hardest effort lurk,
The hands recall the colder days,
Yet move with lighter practiced ease,
Summer proves that work can praise,
The pause that lets the muscles breathe.
```

15.
```text
The street grows quiet in the glare,
It waits for evening's softer claim,
Summer knows when not to dare,
And lets the hush speak just the same,
Stillness settles without fear,
It holds the heat like gathered grain,
Summer keeps the moment near,
Before the night can take the reins.
```

16.
```text
A laugh runs far in open air,
It trips on nothing as it flies,
Summer proves that joy can bear,
The weight of truth without disguise,
Sound travels where the heart has room,
It echoes back with warmer tone,
Summer teaches how to bloom,
By being fully, loudly known.
```

17.
```text
The sun keeps watch from honest height,
It misses nothing in its gaze,
Summer learns that steady sight,
Can soften even blazing days,
Heat presses close but does not bind,
It asks the will to meet its test,
Summer shows the patient mind,
Can find relief by staying blessed.
```

18.
```text
A sailboat creaks in lazy ease,
It rocks with tides that do not rush,
Summer trusts the smallest breeze,
To say what silence cannot hush,
Motion comes without demand,
It follows water's gentler way,
Summer puts the helm in hand,
And lets the current have its say.
```

19.
```text
The harbor hums with open eyes,
It sees the work and lets it be,
Summer frees the how and why,
And leaves the what to drift at sea,
Labor rests beside delight,
Each learning something from the other,
Summer balances the light,
By letting duty walk with brother.
```

20.
```text
A shadow shrinks beneath the noon,
It knows the sun will not relent,
Summer holds the hours soon,
And spends them all with glad intent,
Even darkness learns to wait,
It steps aside until its time,
Summer teaches how to rate,
The worth of joy without a dime.
```

##### `quips.season.summer.medium` (46 entries)

1.
```text
The sun lingers late above the quay,
It listens to the water talk,
Summer lets the daylight wander free,
And slows the pace of every walk.
```

2.
```text
A bell rings thin in heated air,
As if it sweats like any hand,
Summer knows the sound will stay out there,
Long after shade has been planned.
```

3.
```text
The tide rolls in with golden skin,
It glimmers secrets into sand,
Summer keeps the hours warm within,
And leaves them open, uncommanded.
```

4.
```text
Bare feet learn the dock by grain,
They count the planks by heat and scar,
Summer teaches pain is not the same,
When laughter shows how close you are.
```

5.
```text
The harbor smells of pitch and tar,
And something sweet that drifts nearby,
Summer blends the near and far,
Until the days forget to hurry by.
```

6.
```text
A sail snaps white against the blue,
It argues gently with the breeze,
Summer trusts the wind to see it through,
And lets the effort move with ease.
```

7.
```text
The market hums in open sound,
Coins click bright on open palm,
Summer spreads the voices round,
And trades the rush for lingering calm.
```

8.
```text
A pitcher sweats beside the door,
It cools the hands that lift it fast,
Summer gives the body more,
Than memory will ever last.
```

9.
```text
The sun writes long across the stone,
It spells the hours without shame,
Summer knows it's not alone,
In stretching time to fit its flame.
```

10.
```text
The dockcat sleeps in fearless light,
It trusts the heat to guard its rest,
Summer teaches day and night,
Can share the same unbroken chest.
```

11.
```text
A breeze steals salt from every tongue,
It tastes of days both bright and slow,
Summer knows when we are young,
By how we let the moments go.
```

12.
```text
The bell rings once, then waits to hear,
If anyone will mind the call,
Summer learns the rule is clear,
Not every sound must rise or fall.
```

13.
```text
The tide leaves mirrors on the sand,
Where sky and footstep briefly meet,
Summer sets the world unplanned,
And lets reflection find its feet.
```

14.
```text
A rope dries fast in lengthened light,
It smells of hemp and honest work,
Summer turns the strain to slight,
And makes the hardest effort lurk.
```

15.
```text
The street grows quiet in the glare,
It waits for evening's softer claim,
Summer knows when not to dare,
And lets the hush speak just the same.
```

16.
```text
A laugh runs far in open air,
It trips on nothing as it flies,
Summer proves that joy can bear,
The weight of truth without disguise.
```

17.
```text
The sun keeps watch from honest height,
It misses nothing in its gaze,
Summer learns that steady sight,
Can soften even blazing days.
```

18.
```text
A sailboat creaks in lazy ease,
It rocks with tides that do not rush,
Summer trusts the smallest breeze,
To say what silence cannot hush.
```

19.
```text
The harbor hums with open eyes,
It sees the work and lets it be,
Summer frees the how and why,
And leaves the what to drift at sea.
```

20.
```text
A shadow shrinks beneath the noon,
It knows the sun will not relent,
Summer holds the hours soon,
And spends them all with glad intent.
```

21.
```text
The bell rings thin in sunstruck stone,
It wonders if the day will end,
Summer claims the time its own,
And lets the evening wait its turn.
```

22.
```text
A gull grows bold on longer days,
It steals with less remorse than shame,
Summer teaches hunger ways,
That winter never dared to name.
```

23.
```text
The heat forgives the smallest sin,
If laughter's quick to usher in,
Summer lets the light begin,
Where stricter seasons would rescind.
```

24.
```text
A rope lies loose beside the rail,
It rests before the work resumes,
Summer knows that pause will sail,
Before the labor reconsumes.
```

25.
```text
The sun reads time in lengthened grain,
Not hours lost, but warmth to gain,
Summer trades the clock's refrain,
For moments that refuse to wane.
```

26.
```text
The harbor breathes with quieter pride,
It trusts the calm but knows surprise,
Summer lets the tide decide,
What stays in sight and what defies.
```

27.
```text
A pitcher empties faster now,
Than any careful promise made,
Summer knows the thirst and how,
To meet it in the cooling shade.
```

28.
```text
The streetlight flickers late and low,
As if unsure it should appear,
Summer lets the daylight go,
Only when the dark is clear.
```

29.
```text
A sail mends slow in patient heat,
Each stitch a pause, each pause a beat,
Summer makes the effort sweet,
By letting time and hands compete.
```

30.
```text
The tide returns with quieter grace,
It cools the shore it warmed before,
Summer softens every face,
That stood too hard in days of yore.
```

31.
```text
The dock boards warm beneath the feet,
They hold the sun without complaint,
Summer teaches heat to meet,
The body's trust and not its faint.
```

32.
```text
A bell rings low at close of day,
Reluctant now to chase away,
Summer lets the sound delay,
And keeps the dusk from having sway.
```

33.
```text
The sea wears blue like borrowed silk,
It moves as smooth as poured-out milk,
Summer makes the motion guiltless,
And frees the hours from careful tilt.
```

34.
```text
A hat brim learns the art of shade,
It saves the eyes the sun would raid,
Summer knows the price is paid,
By choosing where the light is laid.
```

35.
```text
The docks ring warm with careless sound,
Of boots that linger, hands that stay,
Summer spreads the noise around,
And lets the evening find its way.
```

36.
```text
The wind forgets its winter name,
It speaks in warmth instead of blame,
Summer shifts the rules of flame,
And calls the gentler burn the same.
```

37.
```text
A rope sighs soft when knots are right,
It rests at last through honest night,
Summer proves the day's long light,
Can make the ending feel polite.
```

38.
```text
The harbor listens more than speaks,
It learns the art of open weeks,
Summer stretches time it keeps,
And counts the days in shallower peaks.
```

39.
```text
A laugh returns at close of work,
It finds the space the heat has made,
Summer lets the serious shirk,
And trades the rulebook for the shade.
```

40.
```text
The sun slips west but will not say,
That night is waiting close behind,
Summer guards the final ray,
And leaves the rest for stars to find.
```

41.
```text
The tide leaves cool along the shore,
It whispers thanks, then asks no more,
Summer shows what leaving's for,
When staying warmed the hours before.
```

42.
```text
A lantern waits beside the door,
It knows its time is coming soon,
Summer lets the light ignore,
The call of night and rising moon.
```

43.
```text
The street smells dust and something sweet,
As day and dusk begin to blend,
Summer finds the place they meet,
And lets the moment gently end.
```

44.
```text
A gull wheels high against the blue,
It trusts the air to see it through,
Summer keeps the promise true,
That falling still can feel like flew.
```

45.
```text
The bell rings once in cooling air,
It knows the heat has had its say,
Summer leaves the evening fair,
And walks the daylight on its way.
```

46.
```text
The harbor sighs as shadows grow,
It gives the sun a final nod,
Summer teaches how to go,
Without the weight of being odd.
```

##### `quips.season.summer.short` (49 entries)

1.
```text
The sun leans close to hear the shore,
It wants the secrets heat is for.
```

2.
```text
Bright days forget to count their hours,
They spend them all on shade and flowers.
```

3.
```text
The harbor smells of pitch and tar,
And something sweet that travels far.
```

4.
```text
A noon-bell rings with lazy grace,
It knows the heat has won the race.
```

5.
```text
The tide moves slow in golden skin,
It shimmers secrets deep within.
```

6.
```text
Bare feet learn roads by grain and stone,
They map the town by touch alone.
```

7.
```text
The sun writes long along the quay,
Its letters warm and hard to flee.
```

8.
```text
A sail snaps white against the blue,
It dares the wind to see it through.
```

9.
```text
The air tastes ripe with resined rope,
And all the easy kinds of hope.
```

10.
```text
The dockcat sleeps in fearless light,
No shadow dares disturb its right.
```

11.
```text
A pitcher sweats beside the door,
It cools the hands that ask for more.
```

12.
```text
The gulls complain with fuller throats,
They know the worth of dropped-off boats.
```

13.
```text
The market hums in open sound,
Coins sweat before they hit the ground.
```

14.
```text
A summer laugh rings loud and clear,
It startles sense and bends the ear.
```

15.
```text
The sun counts knots on idle lines,
It likes the way the hemp entwines.
```

16.
```text
Warm planks complain beneath the load,
Of stories spilled and freely owed.
```

17.
```text
The bell rings once, then thinks it through,
Deciding heat deserves its due.
```

18.
```text
A breeze steals salt from every tongue,
It tastes of days forever young.
```

19.
```text
The tide leaves mirrors on the sand,
Where sky and footstep try to stand.
```

20.
```text
A rope dries fast and smells of sun,
It dreams the work is almost done.
```

21.
```text
The light stays late to hear a tale,
It leans against the tavern rail.
```

22.
```text
A shadow shrinks beneath the noon,
It knows the sun will not leave soon.
```

23.
```text
The sea wears blue like borrowed silk,
It moves as smooth as poured-out milk.
```

24.
```text
A hat brim learns the art of shade,
It saves the eyes the sun would raid.
```

25.
```text
The docks ring warm with careless sound,
Of boots that don't yet seek the ground.
```

26.
```text
The wind forgets its winter name,
It speaks in warmth instead of blame.
```

27.
```text
A sail mends slow in patient heat,
Each stitch a pause, each pause a beat.
```

28.
```text
The sun keeps watch from honest height,
It misses nothing in its sight.
```

29.
```text
The tide turns gold before it fades,
Then slips away through cooler shades.
```

30.
```text
A pitcher empties faster now,
Than any careful promise how.
```

31.
```text
The street grows quiet in the glare,
It waits for evening's gentler air.
```

32.
```text
The bell rings thin in sunstruck stone,
It knows it's not alone, alone.
```

33.
```text
A gull grows bold on longer days,
It steals with less remorse than praise.
```

34.
```text
The heat forgives the smallest sin,
If laughter's quick to usher in.
```

35.
```text
A rope lies loose, its work complete,
It naps beneath the sailor's feet.
```

36.
```text
The sun reads time in lengthened grain,
Not hours lost, but warmth to gain.
```

37.
```text
The harbor hums with open eyes,
It trusts the calm but knows surprise.
```

38.
```text
The shade feels earned beneath the wall,
A gift that answers summer's call.
```

39.
```text
The sea keeps secrets warm and deep,
It lets them drift while others sleep.
```

40.
```text
A laugh runs far in open air,
It trips on nothing, free of care.
```

41.
```text
The dockcat stretches long and slow,
It knows the sun won't let it go.
```

42.
```text
The light stays kind beyond its shift,
It gives the day a second gift.
```

43.
```text
A sailboat creaks in lazy ease,
It argues gently with the breeze.
```

44.
```text
The sun slips west but won't admit,
That night is waiting close to it.
```

45.
```text
The heat makes metal soft and sweet,
It bends the day around your feet.
```

46.
```text
The tide returns with quieter grace,
It leaves cool prints in summer's face.
```

47.
```text
The bell rings low at close of day,
Reluctant now to chase away.
```

48.
```text
The harbor breathes a softer sigh,
As evening writes its first reply.
```

49.
```text
A star appears while light still clings,
To prove the night remembers things.
```

#### `winter`

##### `quips.season.winter.long` (20 entries)

1.
```text
The harbor stiffens under ice,
As ropes complain of borrowed years,
Cold teaches every knot its price,
And weighs the words we meant as cheers,
A lantern guards a tighter flame,
It wastes no glow on empty air,
Winter refines the truest claim,
By testing what we choose to bear.
```

2.
```text
The bell rings sharp in brittle dawn,
Its sound cuts clean through frozen breath,
Winter strips the comfort drawn,
From lies that hid the shape of death,
Each echo stands without a veil,
No warmth to soften what is said,
Cold makes the smallest truth prevail,
And leaves no place for words to tread.
```

3.
```text
The tide moves slow in iron skin,
It drags the night back to the quay,
Winter counts the heat within,
And asks what part of us is free,
A frozen rail burns through the hand,
It teaches touch a harder way,
Cold shows what strength will truly stand,
When gentler seasons slip away.
```

4.
```text
The moon hangs close on winter nights,
As if it slipped the sky's tight seam,
Its silver presses docks and sights,
And turns the sea to solid gleam,
The dark grows thick with waiting time,
Each moment sharp and hard to move,
Winter teaches how to climb,
By proving what we cannot prove.
```

5.
```text
The wind repeats no gentle lie,
It strips each boast down to the bone,
Cold does not care how fast we try,
It measures truth by what is shown,
A shutter shakes beneath the gust,
It holds by nail and weathered frame,
Winter respects the honest trust,
Of staying put without a name.
```

6.
```text
A kettle hums before it sings,
It knows the worth of patient heat,
Cold teaches how endurance brings,
A strength that haste will never meet,
The pause before the boiling sound,
Is where the promise gathers might,
Winter finds the deepest ground,
In holding fast against the night.
```

7.
```text
The dock boards crack beneath the frost,
They speak in pops of older strain,
Cold counts the warmth that has been lost,
And asks the bones to pay in pain,
Each sound records the weight of years,
Each split a ledger written deep,
Winter keeps the book of fears,
And tallies what we try to keep.
```

8.
```text
The fog rolls in with frozen grace,
It hides the harbor just enough,
Cold erases every face,
Until the soul is bare and rough,
We walk by memory and sound,
Unsure which step will meet the ground,
Winter teaches truth is found,
When sight is lost but will is bound.
```

9.
```text
A rope grows stiff beneath the hand,
It argues hard with practiced skill,
Cold turns the fiber into sand,
That only patience can fulfill,
Each knot resists with honest force,
It will not yield to careless might,
Winter sets the careful course,
Where strength is earned by staying tight.
```

10.
```text
The fire burns with quieter sound,
It wastes no spark on empty cheer,
Cold rewards the tightly bound,
Who choose to warm what lingers near,
A blaze that leaps will quickly fail,
It leaves the dark to claim the rest,
Winter favors embers pale,
That hold their ground within the chest.
```

11.
```text
The harbor sleeps with one eye wide,
It trusts no calm the ice suggests,
Cold knows the truth we often hide,
That stillness sometimes masks the tests,
A ship at rest is not yet safe,
It waits the thaw with cautious will,
Winter sharpens every faith,
By asking what will hold us still.
```

12.
```text
A crow cries out against the white,
Its voice a nail in silent wood,
Cold sharpens black against the light,
And dares us call the contrast good,
No color hides in winter's glare,
Each shade stands clear and undefended,
Winter teaches how to stare,
At truths we wish were more blended.
```

13.
```text
The wind learns every crack and seam,
It pries at doors with patient might,
Cold tests the strength of every beam,
That swore it'd stand through endless night,
A wall is judged by smallest gap,
A promise by the least kept word,
Winter redraws the careful map,
Where flaws are seen, not gently blurred.
```

14.
```text
A frozen knot resists the hand,
It keeps its shape by force alone,
Cold explains what strength has planned,
When gentler seasons have not known,
To yield too soon is to be lost,
To strain too hard is also wrong,
Winter names the careful cost,
Of holding on just long enough.
```

15.
```text
The moonlight pools like broken glass,
Along the rail and frozen stone,
Cold makes the hours slowly pass,
So each must be endured alone,
Yet time grows sharp enough to cut,
The lies we used to keep us warm,
Winter leaves no shelter shut,
To spare the heart its truest form.
```

16.
```text
A lantern hums with guarded flame,
It leans but will not lose its place,
Cold respects the quiet claim,
Of standing firm without a face,
The light that lasts is not the bold,
It does not shout or overreach,
Winter crowns the steady hold,
That teaches warmth how to be teach.
```

17.
```text
The tide withdraws, then comes again,
It moves by laws we cannot see,
Cold teaches loss without a friend,
Then shows return in harsh decree,
Absence carves a deeper mark,
Than presence ever dares to make,
Winter trains the eye in dark,
To know what paths the sea will take.
```

18.
```text
A street goes still beneath the frost,
It keeps the prints of those who tried,
Cold records the warmth we lost,
And measures who could still abide,
Each step remains though feet have fled,
A map of courage left behind,
Winter reads the marks we spread,
And judges what we meant to find.
```

19.
```text
The bell rings twice at early dark,
As if to count the living few,
Cold draws its circle stark and stark,
Around the brave and merely true,
No sound is spared by frozen air,
Each note must stand without disguise,
Winter asks if we will dare,
To hear the truth before it dies.
```

20.
```text
A window fogs with waiting breath,
It marks the line where heat survives,
Cold explains the shape of death,
By teaching how the warm still strives,
Between the glass and outer air,
A fragile balance must be kept,
Winter shows how much we care,
By how we guard what has not slept.
```

##### `quips.season.winter.medium` (47 entries)

1.
```text
The harbor locks its breath in ice,
While lanterns practice staying brave,
Cold makes each promise costlier price,
Yet light still answers what we crave.
```

2.
```text
The bell rings sharp through frozen air,
It cuts the dark like tempered steel,
Winter makes every sound declare,
The truth of what the bones can feel.
```

3.
```text
A frostbit rope grows stiff and pale,
It argues hard with practiced hands,
Each knot becomes a careful tale,
Of holding fast when cold commands.
```

4.
```text
The moon looks close on winter nights,
As if it slipped the sky's great seam,
Its silver weighs on docks and sights,
And turns the sea to rigid gleam.
```

5.
```text
The wind repeats no gentle lie,
It strips each boast down to the core,
Cold teaches words to justify,
What warmth once said with less and more.
```

6.
```text
A kettle sings with honest steam,
It knows the worth of patient heat,
Winter refines the smallest dream,
Until it's strong enough to meet.
```

7.
```text
The dock boards crack beneath the frost,
They speak in pops of older strain,
Cold counts the warmth that's been lost,
And asks the bones to pay in pain.
```

8.
```text
A shutter learns to close in time,
It fears the long, unblinking night,
Winter respects the careful rhyme,
Of sealing tight to guard the light.
```

9.
```text
The tide comes in with heavier tread,
Its breath goes white against the quay,
Cold weighs the words the summer said,
And files them down to what must be.
```

10.
```text
A mitten dropped beside the pier,
Remembers heat it cannot keep,
Winter makes absence sharp and clear,
And teaches loss to settle deep.
```

11.
```text
The stars grow brittle in the cold,
They glitter hard and far away,
Winter prefers the truths we hold,
When comfort learns to look like gray.
```

12.
```text
A bell rope burns the naked palm,
It leaves a mark that will not fade,
Cold proves endurance isn't calm,
But staying when you're sorely made.
```

13.
```text
The fog rolls in with frozen grace,
It keeps its secrets close and thin,
Winter erases every face,
Until the soul looks out from skin.
```

14.
```text
A net stiffens with salted years,
It creaks beneath remembered loads,
Cold brings the weight of quiet fears,
That travel deep in common roads.
```

15.
```text
The fire burns with steadier sound,
It wastes no spark on empty cheer,
Winter rewards the tightly bound,
Who choose to warm what lingers near.
```

16.
```text
The harbor sleeps with one eye wide,
It trusts no calm the ice suggests,
Cold knows the truth we often hide,
That stillness sometimes masks the tests.
```

17.
```text
A crow cries out against the white,
Its voice a nail in silent wood,
Winter sharpens black and light,
Until they argue what is good.
```

18.
```text
The wind learns every crack and seam,
It pries at doors with patient might,
Cold tests the strength of every beam,
That swore it'd stand through endless night.
```

19.
```text
A frozen knot resists the hand,
It keeps its shape by force alone,
Winter explains what strength has planned,
When gentler seasons have not known.
```

20.
```text
The moonlight pools like broken glass,
Along the rail and frozen stone,
Cold makes the hours slowly pass,
So each one must be faced alone.
```

21.
```text
A lantern hums with guarded flame,
It leans but will not yield its place,
Winter respects the quiet claim,
Of holding on without a face.
```

22.
```text
The tide withdraws, then comes again,
It moves by laws beyond our sight,
Cold teaches loss without a friend,
Then shows return in harsher light.
```

23.
```text
A street goes still beneath the frost,
It keeps the prints of those who tried,
Winter records the warmth we lost,
And measures who could still abide.
```

24.
```text
The bell rings twice at early dark,
As if to count the living few,
Cold draws its circle, stark and stark,
Around the brave and merely true.
```

25.
```text
A window fogs with waiting breath,
It marks the line where heat survives,
Winter explains the shape of death,
By teaching how the warm still strives.
```

26.
```text
The docks grow quiet without shame,
They've learned the weight of shorter days,
Cold strips the world of borrowed flame,
And leaves the core in honest ways.
```

27.
```text
A rope lies coiled with stubborn trust,
It knows the pull that soon will come,
Winter turns patience into must,
And asks the heart to stand or numb.
```

28.
```text
The stars seem farther in the cold,
As if the sky has pulled away,
Winter prefers the truths we hold,
When hope is pale but will not stray.
```

29.
```text
A kettle waits between its boils,
It keeps its promise tight and near,
Cold teaches worth through steady toils,
And finds the brave in quiet cheer.
```

30.
```text
The harbor lamp burns hard and small,
It wastes no glow on distant seas,
Winter demands we choose what's all,
And guard it well through freezing pleas.
```

31.
```text
A bootstep cracks the morning thin,
It sounds too loud for such a place,
Cold draws the world from out within,
And puts it bare before the face.
```

32.
```text
The wind keeps lists of those who stayed,
It checks them twice with bitter breath,
Winter respects the debts we paid,
In heat, in hope, in near and death.
```

33.
```text
A frost-lined rail cuts through the palm,
It leaves the truth in aching skin,
Cold proves endurance isn't calm,
But choosing still to enter in.
```

34.
```text
The sea goes dark beneath the ice,
Yet moves the same as summer taught,
Winter reveals the hidden price,
Of faith we keep but rarely sought.
```

35.
```text
A bell rings clear because it must,
It owes the dark its honest sound,
Cold teaches iron how to trust,
The weight that keeps it tightly bound.
```

36.
```text
The fog returns with whiter face,
It hides the harbor just enough,
Winter prefers the measured pace,
Where seeing less can still be tough.
```

37.
```text
A shutter shakes beneath the gust,
It holds by nail and weathered frame,
Cold proves what shelter truly trusts,
Is not the boast but staying same.
```

38.
```text
The dockcat curls against the stone,
It steals the heat the world forgot,
Winter explains the art of home,
As sharing what you've barely got.
```

39.
```text
The tide moves slow with iron skin,
It drags the night back to the quay,
Cold counts the warmth we carry in,
And asks what part is truly free.
```

40.
```text
A lantern fades but does not die,
It trades its blaze for quieter glow,
Winter respects the how and why,
Of light that learns to travel slow.
```

41.
```text
The streetlight flickers in the frost,
As if to question standing still,
Cold shows the lines we never crossed,
And weighs the measure of our will.
```

42.
```text
A rope grows stiff but does not fail,
It holds because it has been taught,
Winter refines the smallest tale,
Until it bears the load it caught.
```

43.
```text
The harbor waits in frozen calm,
It keeps its faith beneath the ice,
Cold strips the world of borrowed balm,
And leaves what's real at any price.
```

44.
```text
A kettle sings at last for heat,
It breaks the hush with honest sound,
Winter concedes the small defeat,
Where warmth is finally unbound.
```

45.
```text
The bell rings low at break of day,
It knows the cold will not persist,
Winter has much it needs to say,
Before the thaw can still exist.
```

46.
```text
A star burns sharp in bitter air,
It does not blink or look away,
Cold teaches truth to stand and stare,
Until the dark has had its say.
```

47.
```text
The harbor breathes through frozen seams,
It lives despite the iron night,
Winter refines the shape of dreams,
By testing what can hold the light.
```

##### `quips.season.winter.short` (49 entries)

1.
```text
The harbor freezes mid-complaint,
As ropes go stiff and colors faint.
```

2.
```text
Cold bells ring clear through brittle air,
They sound like truth because they dare.
```

3.
```text
The frost writes notes on every pane,
It signs them all with silent pain.
```

4.
```text
A winter lamp burns small but bright,
It argues gently with the night.
```

5.
```text
Bootsteps crack the early morn,
Like old regrets too stiff to warn.
```

6.
```text
The tide moves slow in iron skin,
Still counting debts it's taken in.
```

7.
```text
A kettle sings through chattering teeth,
Promising warmth it hides beneath.
```

8.
```text
The dockcat curls against the cold,
A smug, gray knot of borrowed gold.
```

9.
```text
Ice keeps secrets worse than stone,
It shows you only what it's shown.
```

10.
```text
The wind cuts deals it can't recall,
It takes no blame when sailors fall.
```

11.
```text
A winter star looks sharp and near,
As if it slipped the sky's veneer.
```

12.
```text
The frostbite moon hangs hard and white,
A coin flipped once to choose the night.
```

13.
```text
Old nets grow stiff with salted years,
They creak like men who've swallowed fears.
```

14.
```text
The bell rope burns the naked hand,
A cruel reminder to command.
```

15.
```text
The sea breathes smoke in morning gray,
Then pulls its bitter breath away.
```

16.
```text
A shuttered shop knows every step,
It counts the promises it kept.
```

17.
```text
Snow learns quickly where to lie,
It trusts the ground but tests the sky.
```

18.
```text
The mast complains of aching grain,
It's tired of bearing winter's chain.
```

19.
```text
A frozen knot refuses sense,
It argues hard with consequence.
```

20.
```text
The harbor light blinks once, then twice,
As if to ask the cost of ice.
```

21.
```text
The cold makes liars speak too fast,
Each breath a truth that won't hold past.
```

22.
```text
A mitten dropped beside the quay,
Remembers warmth it used to be.
```

23.
```text
The gulls grow bold when hunger bites,
They steal the day from shorter lights.
```

24.
```text
A winter road looks clean and kind,
It hides the bones it left behind.
```

25.
```text
The tide returns with heavier feet,
Dragging the dark back to the street.
```

26.
```text
A spark survives the cruelest wind,
If fed by hands that won't rescind.
```

27.
```text
The bell rings thin in frozen noon,
As if the day might end too soon.
```

28.
```text
A cask goes quiet in the cold,
Its stories stiffen, half untold.
```

29.
```text
The fog arrives with brittle grace,
It chills the breath upon your face.
```

30.
```text
The dock boards shrink from frozen seams,
They groan beneath remembered dreams.
```

31.
```text
A winter oath weighs twice as much,
It's hard to keep what frost can touch.
```

32.
```text
The moon looks sharp as broken glass,
It cuts the hours as they pass.
```

33.
```text
A sailor's laugh comes late and dry,
It learned to live before goodbye.
```

34.
```text
The wind keeps lists it won't explain,
Of every loss and little gain.
```

35.
```text
A lantern's glow grows tight and mean,
It guards its heat like jealous kin.
```

36.
```text
The sea goes still, then cracks its knuckles,
Preparing tricks no chart unbuckles.
```

37.
```text
The cold makes iron slow to bend,
And harder still for hearts to mend.
```

38.
```text
A frostbit prayer goes straight and bare,
It has no time for frill or flair.
```

39.
```text
The harbor sleeps with one eye open,
Afraid of what the thaw has spoken.
```

40.
```text
A winter coin feels twice its weight,
When hope must pass through frozen gates.
```

41.
```text
The tide ignores the longest night,
It moves by rules beyond our sight.
```

42.
```text
A rope grows stiff but does not fail,
It trusts the knot, not fortune's tale.
```

43.
```text
The bell rings clear because it must,
Cold air makes honest work of trust.
```

44.
```text
A frozen star still finds its mark,
It burns the same in deepest dark.
```

45.
```text
The dockcat knows the warmest stone,
And claims it fast as rightful throne.
```

46.
```text
A winter hush falls hard and deep,
It dares the loudest fear to sleep.
```

47.
```text
The frost keeps time along the rail,
Each crack a tick in silver scale.
```

48.
```text
The sea forgives but not the cold,
It keeps what winter dares to hold.
```

49.
```text
The night grows long but not unkind,
It leaves a thinner dawn to find.
```

### Region and Generic Pools

#### `frozenfar`

##### `quips.frozenfar.long` (36 entries)

1.
```text
Beneath the aurora's watchful sweep,
The tundra keeps its ancient law,
What you swear the ice will keep,
And break you if you stand in awe,
Ten-Towns trade by courage weighed,
By shared heat and borrowed trust,
The north remembers every aid,
And writes its debts in snow and rust.
```

2.
```text
In Targos the sled lingers into snow,
While travelers learn to measure go,
The frostwind can make the kindest rime,
And turn a proud resolve to time,
Auril keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

3.
```text
In Kelvin's Cairn the long night lingers into road,
While travelers learn to measure load,
The cairn can make the kindest coin,
And turn a proud resolve to sign,,
frost giants keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

4.
```text
In Icewind Dale the midwinter lingers into snow,
While travelers learn to measure go,
The ice-lake can make the kindest rime,
And turn a proud resolve to time,
Auril keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

5.
```text
In Bryn Shander the whiteout lingers into snow,
While travelers learn to measure go,
The ice-lake can make the kindest rime,
And turn a proud resolve to time,,
the Reghed keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

6.
```text
In Bryn Shander the aurora lingers into sand,
While travelers learn to measure hand,
The tundra can make the kindest spice,
And turn a proud resolve to price,,
the Reghed keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

7.
```text
In Termalaine the long night lingers into night,
While travelers learn to measure light,
The sled can make the kindest cold,
And turn a proud resolve to bold,
Auril keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

8.
```text
In Kelvin's Cairn the ice-lake lingers into sand,
While travelers learn to measure hand,
The tundra can make the kindest spice,
And turn a proud resolve to price,,
the Reghed keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

9.
```text
In Bryn Shander the sled lingers into snow,
While travelers learn to measure go,
The cairn can make the kindest rime,
And turn a proud resolve to time,,
cold spirits keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

10.
```text
In Caer-Konig the cairn lingers into night,
While travelers learn to measure light,
The tundra can make the kindest cold,
And turn a proud resolve to bold,,
the Reghed keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

11.
```text
In Easthaven the tundra lingers into sand,
While travelers learn to measure hand,
The long night can make the kindest spice,
And turn a proud resolve to price,,
winter wolves keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

12.
```text
In the Spine of the World the frostwind lingers into night,
While travelers learn to measure light,
The cairn can make the kindest cold,
And turn a proud resolve to bold,,
cold spirits keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

13.
```text
In Termalaine the cairn lingers into snow,
While travelers learn to measure go,
The long night can make the kindest rime,
And turn a proud resolve to time,,
winter wolves keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

14.
```text
In Kelvin's Cairn the midwinter lingers into road,
While travelers learn to measure load,
The ice-lake can make the kindest coin,
And turn a proud resolve to sign,,
cold spirits keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

15.
```text
In Easthaven the frostwind lingers into snow,
While travelers learn to measure go,
The sled can make the kindest rime,
And turn a proud resolve to time,,
cold spirits keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

16.
```text
In the Spine of the World the long night lingers into sand,
While travelers learn to measure hand,
The aurora can make the kindest spice,
And turn a proud resolve to price,,
cold spirits keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

17.
```text
In Icewind Dale the tundra lingers into sand,
While travelers learn to measure hand,
The cairn can make the kindest spice,
And turn a proud resolve to price,,
frost giants keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

18.
```text
In Caer-Konig the midwinter lingers into night,
While travelers learn to measure light,
The cairn can make the kindest cold,
And turn a proud resolve to bold,,
the Reghed keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

19.
```text
In Ten-Towns the aurora lingers into sand,
While travelers learn to measure hand,
The cairn can make the kindest spice,
And turn a proud resolve to price,,
the Reghed keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

20.
```text
In Targos the frostwind lingers into snow,
While travelers learn to measure go,
The rime can make the kindest rime,
And turn a proud resolve to time,,
cold spirits keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

21.
```text
In Caer-Dineval the midwinter lingers into sand,
While travelers learn to measure hand,
The long night can make the kindest spice,
And turn a proud resolve to price,,
winter wolves keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

22.
```text
In Caer-Dineval the aurora lingers into road,
While travelers learn to measure load,
The cairn can make the kindest coin,
And turn a proud resolve to sign,,
the Reghed keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

23.
```text
In Caer-Konig the tundra lingers into snow,
While travelers learn to measure go,
The sled can make the kindest rime,
And turn a proud resolve to time,,
the Reghed keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

24.
```text
In Ten-Towns the ice-lake lingers into road,
While travelers learn to measure load,
The midwinter can make the kindest coin,
And turn a proud resolve to sign,,
winter wolves keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

25.
```text
In Targos the frostwind lingers into road,
While travelers learn to measure load,
The midwinter can make the kindest coin,
And turn a proud resolve to sign,
Auril keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

26.
```text
In Icewind Dale the tundra lingers into road,
While travelers learn to measure load,
The whiteout can make the kindest coin,
And turn a proud resolve to sign,,
frost giants keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

27.
```text
In Easthaven the midwinter lingers into sand,
While travelers learn to measure hand,
The rime can make the kindest spice,
And turn a proud resolve to price,,
the Reghed keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

28.
```text
In Icewind Dale the rime lingers into snow,
While travelers learn to measure go,
The cairn can make the kindest rime,
And turn a proud resolve to time,,
winter wolves keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

29.
```text
In Targos the whiteout lingers into night,
While travelers learn to measure light,
The rime can make the kindest cold,
And turn a proud resolve to bold,,
the Reghed keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

30.
```text
In Bryn Shander the whiteout lingers into road,
While travelers learn to measure load,
The frostwind can make the kindest coin,
And turn a proud resolve to sign,,
winter wolves keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

31.
```text
In Bryn Shander the ice-lake lingers into night,
While travelers learn to measure light,
The ice-lake can make the kindest cold,
And turn a proud resolve to bold,,
winter wolves keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

32.
```text
In the Spine of the World the rime lingers into night,
While travelers learn to measure light,
The rime can make the kindest cold,
And turn a proud resolve to bold,,
the Reghed keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

33.
```text
In Termalaine the midwinter lingers into road,
While travelers learn to measure load,
The aurora can make the kindest coin,
And turn a proud resolve to sign,,
frost giants keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

34.
```text
In Ten-Towns the cairn lingers into snow,
While travelers learn to measure go,
The cairn can make the kindest rime,
And turn a proud resolve to time,,
cold spirits keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

35.
```text
In Caer-Konig the midwinter lingers into road,
While travelers learn to measure load,
The long night can make the kindest coin,
And turn a proud resolve to sign,,
cold spirits keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

36.
```text
In Kelvin's Cairn the midwinter lingers into snow,
While travelers learn to measure go,
The cairn can make the kindest rime,
And turn a proud resolve to time,,
frost giants keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

##### `quips.frozenfar.medium` (40 entries)

1.
```text
Ten-Towns huddle round the fire,
As winter weighs each whispered prayer,
The ice demands what hearts require,
And spares the bold who learn to care.
```

2.
```text
Auril's breath still haunts the night,
Old cairns hum beneath the snow,
Frozenfar measures wrong and right,
By how you stand when storms say no.
```

3.
```text
In Icewind Dale the frostwind draws close like stone,
And every promise bends with alone,,
winter wolves watches bargains held with road,
And pays the patient heart with load.
```

4.
```text
In the Spine of the World the whiteout draws close like fire,
And every promise bends with desire,,
cold spirits watches bargains held with care,
And pays the patient heart with air.
```

5.
```text
In Ten-Towns the sled draws close like heat,
And every promise bends with sweet,
Auril watches bargains held with hand,
And pays the patient heart with land.
```

6.
```text
In Targos the sled draws close like tide,
And every promise bends with wide,,
the Reghed watches bargains held with near,
And pays the patient heart with year.
```

7.
```text
In Termalaine the rime draws close like coin,
And every promise bends with sign,
Auril watches bargains held with day,
And pays the patient heart with stay.
```

8.
```text
In Icewind Dale the whiteout draws close like fire,
And every promise bends with desire,,
winter wolves watches bargains held with care,
And pays the patient heart with air.
```

9.
```text
In Caer-Dineval the midwinter draws close like fire,
And every promise bends with desire,,
frost giants watches bargains held with care,
And pays the patient heart with air.
```

10.
```text
In Caer-Konig the frostwind draws close like fire,
And every promise bends with desire,,
cold spirits watches bargains held with care,
And pays the patient heart with air.
```

11.
```text
In Icewind Dale the ice-lake draws close like snow,
And every promise bends with go,,
cold spirits watches bargains held with true,
And pays the patient heart with through.
```

12.
```text
In Caer-Dineval the ice-lake draws close like heat,
And every promise bends with sweet,,
the Reghed watches bargains held with hand,
And pays the patient heart with land.
```

13.
```text
In Caer-Dineval the cairn draws close like snow,
And every promise bends with go,,
frost giants watches bargains held with true,
And pays the patient heart with through.
```

14.
```text
In Icewind Dale the whiteout draws close like gold,
And every promise bends with told,,
frost giants watches bargains held with name,
And pays the patient heart with flame.
```

15.
```text
In Kelvin's Cairn the whiteout draws close like gold,
And every promise bends with told,,
frost giants watches bargains held with name,
And pays the patient heart with flame.
```

16.
```text
In Bryn Shander the ice-lake draws close like stone,
And every promise bends with alone,,
frost giants watches bargains held with road,
And pays the patient heart with load.
```

17.
```text
In Targos the tundra draws close like gold,
And every promise bends with told,,
winter wolves watches bargains held with name,
And pays the patient heart with flame.
```

18.
```text
In the Spine of the World,
the long night draws close like coin,
And every promise bends with sign, cold spirits watches bargains held with day,
And pays the patient heart with stay.
```

19.
```text
In the Spine of the World the frostwind draws close like heat,
And every promise bends with sweet,,
frost giants watches bargains held with hand,
And pays the patient heart with land.
```

20.
```text
In Bryn Shander the frostwind draws close like gold,
And every promise bends with told,,
cold spirits watches bargains held with name,
And pays the patient heart with flame.
```

21.
```text
In Termalaine the cairn draws close like snow,
And every promise bends with go,
Auril watches bargains held with true,
And pays the patient heart with through.
```

22.
```text
In Bryn Shander the aurora draws close like heat,
And every promise bends with sweet,,
the Reghed watches bargains held with hand,
And pays the patient heart with land.
```

23.
```text
In Bryn Shander the cairn draws close like tide,
And every promise bends with wide,,
cold spirits watches bargains held with near,
And pays the patient heart with year.
```

24.
```text
In Caer-Dineval the sled draws close like gold,
And every promise bends with told,,
winter wolves watches bargains held with name,
And pays the patient heart with flame.
```

25.
```text
In the Spine of the World the midwinter draws close like fire,
And every promise bends with desire,,
winter wolves watches bargains held with care,
And pays the patient heart with air.
```

26.
```text
In Icewind Dale the tundra draws close like fire,
And every promise bends with desire,,
frost giants watches bargains held with care,
And pays the patient heart with air.
```

27.
```text
In Caer-Konig the sled draws close like snow,
And every promise bends with go,
Auril watches bargains held with true,
And pays the patient heart with through.
```

28.
```text
In Targos the midwinter draws close like tide,
And every promise bends with wide,,
cold spirits watches bargains held with near,
And pays the patient heart with year.
```

29.
```text
In Ten-Towns the ice-lake draws close like stone,
And every promise bends with alone,
Auril watches bargains held with road,
And pays the patient heart with load.
```

30.
```text
In the Spine of the World the cairn draws close like tide,
And every promise bends with wide,,
frost giants watches bargains held with near,
And pays the patient heart with year.
```

31.
```text
In Kelvin's Cairn the frostwind draws close like coin,
And every promise bends with sign,,
frost giants watches bargains held with day,
And pays the patient heart with stay.
```

32.
```text
In Targos the whiteout draws close like snow,
And every promise bends with go,,
frost giants watches bargains held with true,
And pays the patient heart with through.
```

33.
```text
In Caer-Konig the cairn draws close like heat,
And every promise bends with sweet,,
cold spirits watches bargains held with hand,
And pays the patient heart with land.
```

34.
```text
In Kelvin's Cairn the aurora draws close like tide,
And every promise bends with wide,,
frost giants watches bargains held with near,
And pays the patient heart with year.
```

35.
```text
In Caer-Dineval the long night draws close like heat,
And every promise bends with sweet,
Auril watches bargains held with hand,
And pays the patient heart with land.
```

36.
```text
In Bryn Shander the long night draws close like heat,
And every promise bends with sweet,,
cold spirits watches bargains held with hand,
And pays the patient heart with land.
```

37.
```text
In Kelvin's Cairn the whiteout draws close like fire,
And every promise bends with desire,,
cold spirits watches bargains held with care,
And pays the patient heart with air.
```

38.
```text
In Termalaine the aurora draws close like tide,
And every promise bends with wide,,
frost giants watches bargains held with near,
And pays the patient heart with year.
```

39.
```text
In Caer-Dineval the frostwind draws close like coin,
And every promise bends with sign,,
frost giants watches bargains held with day,
And pays the patient heart with stay.
```

40.
```text
In Icewind Dale the midwinter draws close like tide,
And every promise bends with wide,,
frost giants watches bargains held with near,
And pays the patient heart with year.
```

##### `quips.frozenfar.short` (49 entries)

1.
```text
Ice remembers every name,
The north keeps score in frost and flame.
```

2.
```text
Auroras judge the silent land,
Cold crowns the brave, breaks the unplanned.
```

3.
```text
Wind carves truth from stone and bone,
Frozenfar leaves none alone.
```

4.
```text
Snow hides roads the dead once knew,
The north still listens, cold and true.
```

5.
```text
the Spine of the World listens under ice-lake and gold,
Auril keeps the old tale told.
```

6.
```text
Bryn Shander listens under long night and
road, cold spirits keeps the old tale load.
```

7.
```text
Caer-Dineval listens under midwinter and cold,
frost giants keeps the old tale bold.
```

8.
```text
Bryn Shander listens under aurora and spice,
winter wolves keeps the old tale price.
```

9.
```text
Caer-Konig listens under midwinter and gold,
Auril keeps the old tale told.
```

10.
```text
Bryn Shander listens under tundra and sea,
frost giants keeps the old tale free.
```

11.
```text
Kelvin's Cairn listens under sled and spice,
cold spirits keeps the old tale price.
```

12.
```text
Caer-Dineval listens under whiteout and spice,
frost giants keeps the old tale price.
```

13.
```text
Bryn Shander listens under long night and
law, winter wolves keeps the old tale saw.
```

14.
```text
the Spine of the World listens under frostwind
and gold, winter wolves keeps the old tale told.
```

15.
```text
Targos listens under long night and sand,
frost giants keeps the old tale hand.
```

16.
```text
Caer-Konig listens under ice-lake and road,
the Reghed keeps the old tale load.
```

17.
```text
Bryn Shander listens under midwinter and spice,
cold spirits keeps the old tale price.
```

18.
```text
Targos listens under midwinter and night,
Auril keeps the old tale light.
```

19.
```text
Targos listens under ice-lake and road,
winter wolves keeps the old tale load.
```

20.
```text
Caer-Dineval listens under whiteout and stone,
cold spirits keeps the old tale alone.
```

21.
```text
Kelvin's Cairn listens under frostwind and sea,
frost giants keeps the old tale free.
```

22.
```text
Termalaine listens under whiteout and road,
winter wolves keeps the old tale load.
```

23.
```text
Caer-Konig listens under cairn and road,
Auril keeps the old tale load.
```

24.
```text
Caer-Dineval listens under frostwind and stone,
frost giants keeps the old tale alone.
```

25.
```text
Kelvin's Cairn listens under long night and
gold, frost giants keeps the old tale told.
```

26.
```text
Termalaine listens under whiteout and spice,
cold spirits keeps the old tale price.
```

27.
```text
Easthaven listens under whiteout and flame,
the Reghed keeps the old tale name.
```

28.
```text
Caer-Konig listens under rime and flame,
Auril keeps the old tale name.
```

29.
```text
Icewind Dale listens under aurora and sea,
frost giants keeps the old tale free.
```

30.
```text
Easthaven listens under cairn and road,
cold spirits keeps the old tale load.
```

31.
```text
Kelvin's Cairn listens under tundra and law,
cold spirits keeps the old tale saw.
```

32.
```text
Kelvin's Cairn listens under tundra and road,
the Reghed keeps the old tale load.
```

33.
```text
Icewind Dale listens under aurora and stone,
the Reghed keeps the old tale alone.
```

34.
```text
Caer-Dineval listens under whiteout and gold,
cold spirits keeps the old tale told.
```

35.
```text
Easthaven listens under aurora and spice,
winter wolves keeps the old tale price.
```

36.
```text
Termalaine listens under tundra and stone,
winter wolves keeps the old tale alone.
```

37.
```text
the Spine of the World listens under whiteout and night,
Auril keeps the old tale light.
```

38.
```text
Ten-Towns listens under tundra and spice,
cold spirits keeps the old tale price.
```

39.
```text
Caer-Dineval listens under sled and night,
Auril keeps the old tale light.
```

40.
```text
Caer-Konig listens under long night and night,
the Reghed keeps the old tale light.
```

41.
```text
Caer-Konig listens under rime and sand,
the Reghed keeps the old tale hand.
```

42.
```text
Kelvin's Cairn listens under sled and stone,
Auril keeps the old tale alone.
```

43.
```text
Termalaine listens under rime and law,
winter wolves keeps the old tale saw.
```

44.
```text
Caer-Konig listens under long night and stone,
the Reghed keeps the old tale alone.
```

45.
```text
Bryn Shander listens under whiteout and spice,
Auril keeps the old tale price.
```

46.
```text
Easthaven listens under tundra and stone,
Auril keeps the old tale alone.
```

47.
```text
Easthaven listens under tundra and spice,
frost giants keeps the old tale price.
```

48.
```text
Bryn Shander listens under midwinter and cold,
the Reghed keeps the old tale bold.
```

49.
```text
Kelvin's Cairn listens under aurora and road,
cold spirits keeps the old tale load.
```

#### `generic`

##### `quips.generic.long` (20 entries)

1.
```text
The bell rings out, then thinks again,
It listens hard for what comes back,
Some sounds are shaped by where and when,
And others fade along their track,
A pause can weigh more than a shout,
When meaning needs a moment's space,
The town will answer, in or out,
At its own careful, chosen pace.
```

2.
```text
A map lies flat and calls it true,
It swears the road is settled fact,
Yet boots will argue what they knew,
By every turn the chart has lacked,
We travel more than lines can show,
We learn by leaving marks and scars,
The truest paths are made by go,
Not by the ink of distant stars.
```

3.
```text
The candle flares, then steadies fast,
It knows the cost of burning wild,
A light that wants to last must last,
By learning how to stay mild,
The dark respects a patient glow,
More than a blaze that boasts and dies,
So warmth endures where embers grow,
And quiet fire outlives the cries.
```

4.
```text
A rumor walks on borrowed feet,
It stumbles where the truth stands still,
Yet finds the doors it's meant to meet,
And tests the locks with careful will,
Some words are swift but seldom stay,
Some linger long when softly said,
The tongue may race the mind's delay,
But silence weighs what speech has sped.
```

5.
```text
The tide arrives without a sound,
As if it fears to wake the shore,
Yet leaves its silver marks around,
For dawn to read and ponder more,
The sea does not announce its plans,
It moves by laws it will not share,
We learn its truth by soaked-up sands,
And by the things it takes with care.
```

6.
```text
A clock insists it rules the room,
By cutting moments sharp and neat,
Yet hearts decide the hour's bloom,
And choose which seconds truly meet,
Time bends around what matters most,
It stretches thin or gathers tight,
The hands may boast of what they host,
But feeling writes the day and night.
```

7.
```text
The window knows who lingers late,
It fogs for thoughts that will not sleep,
Some truths refuse to knock or wait,
They press their warmth in inches deep,
We stand between the glass and air,
Unsure which side we ought to choose,
Reflection shows us what we bear,
And hints at what we still refuse.
```

8.
```text
A knot looks plain to passing eyes,
Just rope and hope in simple form,
But sailors know what strength implies,
When weather asks it to perform,
The holding fast is not the show,
It hides its craft in careful turns,
True skill is quiet, learned in slow,
And proven when the hard wind burns.
```

9.
```text
The fire speaks less the more it knows,
It warms the hands, not eager pride,
A blaze that crackles, leaps, and glows,
Will leave the patient cold inside,
Endurance favors steady heat,
That keeps its promise night by night,
The longest warmth is learned by seat,
Not by the flare that steals the sight.
```

10.
```text
The harbor hums when work is done,
Its sounds grow thick at close of day,
Each hull repeats where it has run,
Each rope recalls the weight it lay,
Places remember more than stone,
They keep the shape of passing years,
The sea gives back what it has loaned,
In echoes made of hopes and fears.
```

11.
```text
A promise weighs once fully said,
It pulls the tongue like anchored chain,
Words dream of flight inside the head,
But land as coins that must remain,
To speak is to accept the cost,
Of being held to what you mean,
The lightest vow is never lost,
It leaves a mark where truth has been.
```

12.
```text
The moon arrives without a fuss,
It takes its seat in silver calm,
As if the sky were made for us,
And night a well-rehearsed psalm,
It shows the world in softer lines,
Where edges blur but forms endure,
In borrowed light, the quiet signs,
Reveal what daylight left unsure.
```

13.
```text
A door remembers every knock,
It learns the shapes of hope and doubt,
Some hands arrive prepared to lock,
Others to beg or wander out,
Thresholds are places of delay,
Where choice stands still and weighs its breath,
To cross is not to walk away,
But choose a side of life or death.
```

14.
```text
The street keeps ledgers made of sound,
Each step a note, each pause a rest,
It knows who walks the long way round,
And who cuts through without a test,
Paths judge us less by where we go,
Than by the weight we choose to bear,
The road records what feet will show,
And reads the truth we leave in air.
```

15.
```text
A kettle hums before it sings,
It knows the worth of waiting still,
Heat teaches patience subtle things,
That haste will never quite fulfill,
The pause before the boiling cry,
Is where the promise gathers force,
Not all beginnings race the sky,
Some find their strength by holding course.
```

16.
```text
The wind repeats what walls forget,
It carries words we thought were gone,
Some debts the air will not offset,
They circle back by break of dawn,
What's spoken never truly ends,
It drifts and finds another ear,
The breeze remembers, twists, and bends,
What we believed had disappeared.
```

17.
```text
A rope lies coiled in quiet trust,
It does not fear the weight to come,
For fiber learns by strain and rust,
What standing firm will yet become,
Strength grows in loops and patient turns,
In scars that teach the line to hold,
The cord that bears is one that learns,
From every pull it once withstood.
```

18.
```text
The market wakes with measured sound,
Coins click like rain on open palm,
Each trade a pact that ties the ground,
To hunger, hope, and passing calm,
Exchange is more than goods and gain,
It binds the needs of you and me,
A living web of loss and pain,
And trust that buys community.
```

19.
```text
A shadow stretches late and long,
It practices the art of leave,
Light teaches how to not belong,
So dark may enter and believe,
Departures shape the things that stay,
Absence can sharpen what remains,
We learn the value of the day,
By how the night unties its chains.
```

20.
```text
The bell rings twice for those who wait,
Once more for those already gone,
It knows the cost of being late,
But tolls for both by early dawn,
Time does not choose who hears the call,
It sounds for all with equal tone,
The echo judges none at all,
It fades, then leaves us on our own.
```

##### `quips.generic.medium` (45 entries)

1.
```text
The bell rings out, then thinks it through,
It waits to hear the town reply,
For sound means little if it's new,
And much if silence answers why.
```

2.
```text
A map lies flat with patient grace,
It swears the road is understood,
But boots will argue every place,
And prove the dirt has greater good.
```

3.
```text
The candle flares as if to boast,
Then settles down to honest light,
It knows the dark respects it most,
When it burns steady through the night.
```

4.
```text
A rumor walks on borrowed feet,
It trips where facts prefer to stand,
Yet still it learns which doors will meet,
A knocking done by unseen hand.
```

5.
```text
The tide comes in without a sound,
As if it fears to wake the quay,
But leaves its silver proof around,
For dawn to read and not agree.
```

6.
```text
A clock pretends it rules the room,
By carving seconds out of air,
Yet hearts decide the hour's bloom,
And spend their time with careless care.
```

7.
```text
The window knows who lingers late,
It fogs for thoughts that will not sleep,
Some truths refuse to knock or wait,
They press their warmth in inches deep.
```

8.
```text
A knot looks plain to passing eyes,
Just rope and hope in borrowed form,
But sailors know what faith implies,
When weather asks it to perform.
```

9.
```text
The fire says less the more it learns,
It warms the hands, not needful pride,
A blaze that crackles, boasts, and burns,
Will leave the careful cold inside.
```

10.
```text
The harbor hums a lower tone,
When daylight thins and work is through,
It keeps the sounds that aren't its own,
And lends them back to evening's blue.
```

11.
```text
A promise weighs more once it's said,
It pulls against the tongue like stone,
Words dream of flight inside the head,
But fall like coins when fully thrown.
```

12.
```text
The moon arrives without a fuss,
It takes its seat in silver calm,
As if the sky were made for us,
And night a practiced, gentle psalm.
```

13.
```text
A door remembers every knock,
It learns the shapes of hope and doubt,
Some hands arrive prepared to lock,
Others to beg or wander out.
```

14.
```text
The street keeps ledgers made of sound,
Each step a note, each pause a rest,
It knows who walks the long way round,
And who cuts through without a test.
```

15.
```text
A kettle hums before it sings,
It knows the worth of waiting still,
Heat teaches patience subtle things,
That haste will never quite fulfill.
```

16.
```text
The wind repeats what walls forget,
It carries words we thought were gone,
Some debts the air will not offset,
They circle back by break of dawn.
```

17.
```text
A rope lies coiled in quiet trust,
It does not fear the weight to come,
For fiber learns by strain and rust,
What standing firm will still become.
```

18.
```text
The market wakes with measured sound,
Coins click like rain on open palm,
Each trade a pact that ties the ground,
To hunger, hope, and passing calm.
```

19.
```text
A shadow stretches longer late,
It practices the art of leave,
Light teaches how to abdicate,
So dark may enter and believe.
```

20.
```text
The bell rings twice for those who wait,
Once more for those already gone,
It knows the cost of being late,
But tolls for both by early dawn.
```

21.
```text
A cat observes without a word,
It files the world in narrowed eyes,
Truth often passes by unheard,
While wisdom yawns and looks unwise.
```

22.
```text
The sea forgives but never forgets,
It smooths the edge of broken things,
Yet keeps a book of quiet debts,
And balances them under springs.
```

23.
```text
A letter sealed too fast will learn,
That wax remembers every flame,
Some words return because they burn,
And mark the page they could not tame.
```

24.
```text
The dock boards creak beneath the load,
Of stories told and left behind,
Each plank a witness to the road,
That trades in cargo of the mind.
```

25.
```text
A laugh escapes despite the hour,
It trips the dark and runs ahead,
Joy rarely asks for proper power,
It breaks its rules and goes instead.
```

26.
```text
The compass points with patient will,
It trusts the pole it cannot see,
Faith often works this way still,
By aiming where we hope to be.
```

27.
```text
A lantern knows the wind by name,
It leans but does not lose its claim,
Light learns to bend before the flame,
So it may last and not be shame.
```

28.
```text
The tide withdraws to prove its point,
It leaves the shore to think alone,
Absence can be the sharpest joint,
That cuts through flesh we thought was bone.
```

29.
```text
A bench remembers those who sat,
It warms where bodies paused to be,
Some places keep the shape of that,
Which passed through them but would not stay.
```

30.
```text
The fog arrives without a face,
It borrows streets and makes them strange,
Perspective shifts with gentle pace,
Until the known forgets its range.
```

31.
```text
A nail holds fast without a boast,
It serves the beam, not praise or pride,
Strength often lives where spoken least,
And bears the weight it cannot hide.
```

32.
```text
The bell rope frays where fingers plead,
For one more chance, one longer stay,
Time answers neither want nor need,
It only rings and moves away.
```

33.
```text
A story grows by being told,
It sheds its skin with every ear,
Truth does not mind the shapes it holds,
So long as something real is near.
```

34.
```text
The wind learns names from every sail,
It speaks them back with different breath,
Some lessons never quite grow pale,
They age us gently into depth.
```

35.
```text
A window waits for evening's cool,
It knows the day must end sometime,
Patience is not the lack of rule,
But choosing rest instead of climb.
```

36.
```text
The streetlight flickers once or twice,
As if to ask if night is sure,
Doubt often wears a thoughtful guise,
Before it settles to endure.
```

37.
```text
A rope remembers every hand,
That trusted it with weight and fear,
Some bonds are not of oath or land,
But fiber learned through year on year.
```

38.
```text
The market closes soft and slow,
It folds its noise and counts its gains,
Trade leaves a hum we almost know,
Like distant surf or passing trains.
```

39.
```text
A shadow slips beyond the wall,
It does not ask to be believed,
Truth sometimes leaves without a call,
And proves itself by what's retrieved.
```

40.
```text
The bell rings out to empty air,
Yet still completes its ancient task,
Meaning is not the crowd's affair,
It answers those who dare to ask.
```

41.
```text
A map grows old but roads stay young,
They change their minds with every mile,
The truth we thought we always knew,
May learn to walk a different style.
```

42.
```text
The kettle rests between its boils,
It knows the virtue of the pause,
Work teaches worth through patient toils,
Not only through its final cause.
```

43.
```text
A gull cries out above the pier,
As if it owns the waking day,
Confidence often sounds sincere,
Until the facts decide to stay.
```

44.
```text
The harbor listens more than speaks,
It gathers tales from hull and mast,
Some places learn the art of weeks,
By holding echoes of the past.
```

45.
```text
A candle ends in quiet smoke,
It leaves no ash of loud regret,
Some lives are best when gently spoke,
And finished clean without a debt.
```

##### `quips.generic.short` (49 entries)

1.
```text
The cat knows more than he lets on,
He naps until the truth is gone.
```

2.
```text
A bell rings twice before it's heard,
The silence keeps the sharper word.
```

3.
```text
The tide looks still but counts the sand,
It moves the world by unseen hand.
```

4.
```text
A candle swears it fears the dark,
Yet leaps to burn with eager spark.
```

5.
```text
The wind repeats what walls forget,
And debts the stones remember yet.
```

6.
```text
A quiet dock at break of day
Has more to say than words can say.
```

7.
```text
The kettle hums a waiting tune,
It knows the hour will ripen soon.
```

8.
```text
A sailor smiles and checks the rope,
Because he's learned the shape of hope.
```

9.
```text
The moon pretends it does not spy,
But keeps one open silver eye.
```

10.
```text
Old doors complain when opened wide,
They liked the years they stayed inside.
```

11.
```text
A coin believes it chose the floor,
The purse insists it had one more.
```

12.
```text
The harbor lamp burns calm and slow,
It's seen enough to let things go.
```

13.
```text
A note once sung still haunts the air,
It waits in corners, thin and fair.
```

14.
```text
The clock ticks loud to seem severe,
It's only nervous time is here.
```

15.
```text
A whispered plan walks faster
far Than any shouted standard-bearer's war.
```

16.
```text
The boots by dawn are caked with proof,
That roads are honest, if uncouth.
```

17.
```text
A gull cries out as if it's wise,
Then drops its lunch from too much pride.
```

18.
```text
The rain keeps ledgers on the street,
Each step a mark, each mark a feat.
```

19.
```text
A window knows who passed it by,
It fogs when certain thoughts walk nigh.
```

20.
```text
The fire says less the more it knows,
It warms the hands and burns the prose.
```

21.
```text
A shadow stretches, thin and sly,
To touch a truth that won't walk by.
```

22.
```text
The net looks loose, the knot looks plain,
Until the sea begins to strain.
```

23.
```text
A tavern laugh can tip the scale,
Where reason, dry, is bound to fail.
```

24.
```text
The map lies flat and calls it truth,
The road just grins and steals your youth.
```

25.
```text
A rope remembers every load,
Long after feet forget the road.
```

26.
```text
The cat returns when soup is near,
Coincidence is never clear.
```

27.
```text
A dockside tune with missing ends
Is how the night makes sudden friends.
```

28.
```text
The lantern claims it hates the wind,
Yet leans to hear what blows within.
```

29.
```text
A promise made at half-past two
Counts double if the moon is true.
```

30.
```text
The nail holds fast without a boast,
It knows the beam deserves it most.
```

31.
```text
The sea forgives but never quits,
It keeps a book of borrowed bits.
```

32.
```text
A market shout can sell a lie,
But quiet eyes are hard to buy.
```

33.
```text
The stair complains of every heel,
Yet loves the ones who climb with feel.
```

34.
```text
A folded note outlives the hand,
That thought it done and firmly planned.
```

35.
```text
The fog arrives without a name,
It leaves with secrets just the same.
```

36.
```text
A candle end still smells of light,
Long after it has lost the fight.
```

37.
```text
The bell rope frays where fingers plead,
For one more pause, one lesser need.
```

38.
```text
A shadow naps beside the door,
It's tired of guessing who's before.
```

39.
```text
The tide comes back without a grudge,
It never learned the art of nudge.
```

40.
```text
A whispered joke can break the ice,
More cleanly than the sharpest vice.
```

41.
```text
The compass points with quiet pride,
It knows the world is round and wide.
```

42.
```text
A spilled ale teaches boots to dance,
And grants the floor a fleeting chance.
```

43.
```text
The rope sighs soft when knots are right,
It rests at last through honest night.
```

44.
```text
A creaking mast still stands its watch,
It trusts the patch more than the notch.
```

45.
```text
The moonlight counts the empty chairs,
It waits for those who miss their prayers.
```

46.
```text
A letter sealed too fast will learn,
That wax remembers how to burn.
```

47.
```text
The wind repeats the sailor's lie,
And dares him once more to deny.
```

48.
```text
A dockside cat with folded ears
Has heard enough for seven years.
```

49.
```text
The night keeps time in softer ways,
It measures breaths instead of days.
```

#### `landsofintrigue`

##### `quips.landsofintrigue.long` (42 entries)

1.
```text
In the Lands of Intrigue's glare,
Where Calimshan perfumes deceit,
Power smiles with patient care,
And waits for rivals to repeat,
Amn tallies cost and quiet gain,
Tethyr pays in oath and war,
The south teaches, again and again,
That secrets rule what steel can't force.
```

2.
```text
In Riatavin the ledger lingers into sand,
While travelers learn to measure hand,
The sand can make the kindest spice,
And turn a proud resolve to,
price, pashas keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

3.
```text
In Athkatla the heat haze lingers into road,
While travelers learn to measure load,
The spice can make the kindest coin,
And turn a proud resolve to sign,,
old pacts keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

4.
```text
In Zazesspur the court lingers into snow,
While travelers learn to measure go,
The spice can make the kindest rime,
And turn a proud resolve to time,,
courtly spies keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

5.
```text
In Darromar the caper lingers into road,
While travelers learn to measure load,
The oath can make the kindest coin,
And turn a proud resolve to sign,,
old pacts keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

6.
```text
In Erlkazar the harbor smoke lingers into sand,
While travelers learn to measure hand,
The heat haze can make the kindest spice,
And turn a proud resolve to,
price, pashas keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

7.
```text
In Iriaebor the ledger lingers into road,
While travelers learn to measure load,
The court can make the kindest coin,
And turn a proud resolve to sign,,
old pacts keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

8.
```text
In Athkatla the heat haze lingers into night,
While travelers learn to measure light,
The ledger can make the kindest cold,
And turn a proud resolve to bold,,
merchant princes keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

9.
```text
In Darromar the court lingers into night,
While travelers learn to measure light,
The ledger can make the kindest cold,
And turn a proud resolve to bold,,
courtly spies keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

10.
```text
In Darromar the spice lingers into sand,
While travelers learn to measure hand,
The spice can make the kindest spice,
And turn a proud resolve to,
price, pashas keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

11.
```text
In Memnon the sand lingers into road,
While travelers learn to measure load,
The oath can make the kindest coin,
And turn a proud resolve to sign,,
old pacts keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

12.
```text
In Zazesspur the sand lingers into sand,
While travelers learn to measure hand,
The ledger can make the kindest spice,
And turn a proud resolve to,
price, pashas keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

13.
```text
In Athkatla the caper lingers into snow,
While travelers learn to measure go,
The silk can make the kindest rime,
And turn a proud resolve to time,,
old pacts keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

14.
```text
In Tethyr the harbor smoke lingers into sand,
While travelers learn to measure hand,
The oath can make the kindest spice,
And turn a proud resolve to price,,
merchant princes keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

15.
```text
In Riatavin the silk lingers into sand,
While travelers learn to measure hand,
The whisper can make the kindest spice,
And turn a proud resolve to price,,
courtly spies keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

16.
```text
In Calimport the harbor smoke lingers into night,
While travelers learn to measure light,
The heat haze can make the kindest cold,
And turn a proud resolve to bold,,
courtly spies keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

17.
```text
In Erlkazar the spice lingers into night,
While travelers learn to measure light,
The silk can make the kindest cold,
And turn a proud resolve to bold,,
djinn-blooded tales keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

18.
```text
In Amn the ledger lingers into snow,
While travelers learn to measure go,
The harbor smoke can make the kindest rime,
And turn a proud resolve to,
time, pashas keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

19.
```text
In Zazesspur the spice lingers into night,
While travelers learn to measure light,
The ledger can make the kindest cold,
And turn a proud resolve to bold,,
djinn-blooded tales keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

20.
```text
In Erlkazar the caper lingers into road,
While travelers learn to measure load,
The spice can make the kindest coin,
And turn a proud resolve to sign,,
merchant princes keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

21.
```text
In Riatavin the oath lingers into road,
While travelers learn to measure load,
The oath can make the kindest coin,
And turn a proud resolve to sign,,
courtly spies keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

22.
```text
In Erlkazar the sand lingers into night,
While travelers learn to measure light,
The harbor smoke can make the kindest cold,
And turn a proud resolve to,
bold, pashas keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

23.
```text
In Iriaebor the whisper lingers into snow,
While travelers learn to measure go,
The heat haze can make the kindest rime,
And turn a proud resolve to time,,
merchant princes keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

24.
```text
In Darromar the caper lingers into sand,
While travelers learn to measure hand,
The silk can make the kindest spice,
And turn a proud resolve to price,,
old pacts keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

25.
```text
In Calimport the caper lingers into snow,
While travelers learn to measure go,
The caper can make the kindest rime,
And turn a proud resolve to,
time, pashas keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

26.
```text
In Memnon the sand lingers into snow,
While travelers learn to measure go,
The caper can make the kindest rime,
And turn a proud resolve to,
time, pashas keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

27.
```text
In Calimport the court lingers into sand,
While travelers learn to measure hand,
The caper can make the kindest spice,
And turn a proud resolve to price,,
courtly spies keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

28.
```text
In Tethyr the sand lingers into night,
While travelers learn to measure light,
The oath can make the kindest cold,
And turn a proud resolve to bold,,
courtly spies keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

29.
```text
In Memnon the oath lingers into night,
While travelers learn to measure light,
The court can make the kindest cold,
And turn a proud resolve to,
bold, pashas keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

30.
```text
In Calimport the ledger lingers into snow,
While travelers learn to measure go,
The caper can make the kindest rime,
And turn a proud resolve to time,,
courtly spies keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

31.
```text
In Riatavin the ledger lingers into night,
While travelers learn to measure light,
The court can make the kindest cold,
And turn a proud resolve to bold,,
old pacts keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

32.
```text
In Zazesspur the harbor smoke lingers into night,
While travelers learn to measure light,
The heat haze can make the kindest cold,
And turn a proud resolve to bold,,
courtly spies keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

33.
```text
In Iriaebor the whisper lingers into sand,
While travelers learn to measure hand,
The oath can make the kindest spice,
And turn a proud resolve to price,,
courtly spies keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

34.
```text
In Erlkazar the silk lingers into snow,
While travelers learn to measure go,
The whisper can make the kindest rime,
And turn a proud resolve to time,,
courtly spies keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

35.
```text
In Iriaebor the sand lingers into road,
While travelers learn to measure load,
The silk can make the kindest coin,
And turn a proud resolve to sign,,
courtly spies keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

36.
```text
In Riatavin the oath lingers into snow,
While travelers learn to measure go,
The silk can make the kindest rime,
And turn a proud resolve to time,,
merchant princes keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

37.
```text
In Athkatla the whisper lingers into snow,
While travelers learn to measure go,
The harbor smoke can make the kindest rime,
And turn a proud resolve to,
time, pashas keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

38.
```text
In Riatavin the oath lingers into night,
While travelers learn to measure light,
The oath can make the kindest cold,
And turn a proud resolve to bold,,
djinn-blooded tales keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

39.
```text
In Athkatla the harbor smoke lingers into night,
While travelers learn to measure light,
The ledger can make the kindest cold,
And turn a proud resolve to,
bold, pashas keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

40.
```text
In Amn the harbor smoke lingers into night,
While travelers learn to measure light,
The whisper can make the kindest cold,
And turn a proud resolve to bold,,
old pacts keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

41.
```text
In Erlkazar the caper lingers into night,
While travelers learn to measure light,
The spice can make the kindest cold,
And turn a proud resolve to bold,,
courtly spies keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

42.
```text
In Calimport the caper lingers into sand,
While travelers learn to measure hand,
The harbor smoke can make the kindest spice,
And turn a proud resolve to price,,
old pacts keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

##### `quips.landsofintrigue.medium` (42 entries)

1.
```text
Calimshan trades in shadowed gold,
Where djinn and princes share the sand,
The south remembers stories told,
By those who dared to command.
```

2.
```text
Amn buys truth by measured scale,
Tethyr bleeds for crown and land,
Intrigue keeps the ledger pale,
And sharpens every open hand.
```

3.
```text
In Erlkazar the caper draws close like tide,
And every promise bends with wide,,
courtly spies watches bargains held with near,
And pays the patient heart with year.
```

4.
```text
In Zazesspur the silk draws close like fire,
And every promise bends with desire,,
pashas watches bargains held with care,
And pays the patient heart with air.
```

5.
```text
In Calimport the harbor smoke draws close like heat,
And every promise bends with sweet,,
courtly spies watches bargains held with hand,
And pays the patient heart with land.
```

6.
```text
In Memnon the oath draws close like gold,
And every promise bends with told,,
old pacts watches bargains held with name,
And pays the patient heart with flame.
```

7.
```text
In Riatavin the oath draws close like snow,
And every promise bends with go,,
old pacts watches bargains held with true,
And pays the patient heart with through.
```

8.
```text
In Riatavin the whisper draws close like coin,
And every promise bends with sign,,
merchant princes watches bargains held with day,
And pays the patient heart with stay.
```

9.
```text
In Iriaebor the harbor smoke draws close like stone,
And every promise bends with alone,,
old pacts watches bargains held with road,
And pays the patient heart with load.
```

10.
```text
In Tethyr the ledger draws close like tide,
And every promise bends with wide,,
djinn-blooded tales watches bargains held with near,
And pays the patient heart with year.
```

11.
```text
In Erlkazar the whisper draws close like fire,
And every promise bends with desire,,
merchant princes watches bargains held with care,
And pays the patient heart with air.
```

12.
```text
In Athkatla the silk draws close like fire,
And every promise bends with desire,,
pashas watches bargains held with care,
And pays the patient heart with air.
```

13.
```text
In Riatavin the sand draws close like gold,
And every promise bends with told,,
merchant princes watches bargains held with name,
And pays the patient heart with flame.
```

14.
```text
In Tethyr the court draws close like stone,
And every promise bends with alone,,
courtly spies watches bargains held with road,
And pays the patient heart with load.
```

15.
```text
In Zazesspur the spice draws close like gold,
And every promise bends with told,,
djinn-blooded tales watches bargains held with name,
And pays the patient heart with flame.
```

16.
```text
In Amn the sand draws close like tide,
And every promise bends with wide,,
djinn-blooded tales watches bargains held with near,
And pays the patient heart with year.
```

17.
```text
In Tethyr the heat haze draws close like gold,
And every promise bends with told,,
pashas watches bargains held with name,
And pays the patient heart with flame.
```

18.
```text
In Iriaebor the spice draws close like tide,
And every promise bends with wide,,
merchant princes watches bargains held with near,
And pays the patient heart with year.
```

19.
```text
In Memnon the harbor smoke draws close like snow,
And every promise bends with go,,
djinn-blooded tales watches bargains held with true,
And pays the patient heart with through.
```

20.
```text
In Tethyr the sand draws close like tide,
And every promise bends with wide,,
pashas watches bargains held with near,
And pays the patient heart with year.
```

21.
```text
In Memnon the oath draws close like tide,
And every promise bends with wide,,
djinn-blooded tales watches bargains held with near,
And pays the patient heart with year.
```

22.
```text
In Calimport the ledger draws close like tide,
And every promise bends with wide,,
pashas watches bargains held with near,
And pays the patient heart with year.
```

23.
```text
In Amn the harbor smoke draws close like fire,
And every promise bends with desire,,
old pacts watches bargains held with care,
And pays the patient heart with air.
```

24.
```text
In Athkatla the caper draws close like tide,
And every promise bends with wide,,
merchant princes watches bargains held with near,
And pays the patient heart with year.
```

25.
```text
In Athkatla the oath draws close like stone,
And every promise bends with alone,,
djinn-blooded tales watches bargains held with road,
And pays the patient heart with load.
```

26.
```text
In Riatavin the spice draws close like fire,
And every promise bends with desire,,
merchant princes watches bargains held with care,
And pays the patient heart with air.
```

27.
```text
In Erlkazar the ledger draws close like stone,
And every promise bends with alone,,
pashas watches bargains held with road,
And pays the patient heart with load.
```

28.
```text
In Erlkazar the ledger draws close like fire,
And every promise bends with desire,,
djinn-blooded tales watches bargains held with care,
And pays the patient heart with air.
```

29.
```text
In Darromar the ledger draws close like stone,
And every promise bends with alone,,
old pacts watches bargains held with road,
And pays the patient heart with load.
```

30.
```text
In Athkatla the silk draws close like heat,
And every promise bends with sweet,,
courtly spies watches bargains held with hand,
And pays the patient heart with land.
```

31.
```text
In Zazesspur the court draws close like coin,
And every promise bends with sign,,
djinn-blooded tales watches bargains held with day,
And pays the patient heart with stay.
```

32.
```text
In Amn the silk draws close like heat,
And every promise bends with sweet,,
pashas watches bargains held with hand,
And pays the patient heart with land.
```

33.
```text
In Darromar the whisper draws close like gold,
And every promise bends with told,,
merchant princes watches bargains held with name,
And pays the patient heart with flame.
```

34.
```text
In Darromar the caper draws close like tide,
And every promise bends with wide,,
courtly spies watches bargains held with near,
And pays the patient heart with year.
```

35.
```text
In Zazesspur the oath draws close like stone,
And every promise bends with alone,,
merchant princes watches bargains held with road,
And pays the patient heart with load.
```

36.
```text
In Zazesspur the harbor smoke draws close like heat,
And every promise bends with sweet,,
pashas watches bargains held with hand,
And pays the patient heart with land.
```

37.
```text
In Darromar the spice draws close like coin,
And every promise bends with sign,,
courtly spies watches bargains held with day,
And pays the patient heart with stay.
```

38.
```text
In Amn the heat haze draws close like coin,
And every promise bends with sign,,
merchant princes watches bargains held with day,
And pays the patient heart with stay.
```

39.
```text
In Amn the whisper draws close like stone,
And every promise bends with alone,,
old pacts watches bargains held with road,
And pays the patient heart with load.
```

40.
```text
In Zazesspur the spice draws close like coin,
And every promise bends with sign,,
merchant princes watches bargains held with day,
And pays the patient heart with stay.
```

41.
```text
In Riatavin the oath draws close like tide,
And every promise bends with wide,,
djinn-blooded tales watches bargains held with near,
And pays the patient heart with year.
```

42.
```text
In Amn the spice draws close like gold,
And every promise bends with told,,
merchant princes watches bargains held with name,
And pays the patient heart with flame.
```

##### `quips.landsofintrigue.short` (48 entries)

1.
```text
Calimshan's sun hides knives and spice,
Every smile has weighed its price.
```

2.
```text
Amn counts profit Tethyr blood,
Intrigue runs thicker than the mud.
```

3.
```text
Old pacts rot slow in southern heat,
Power listens, cool and sweet.
```

4.
```text
Memnon listens under spice and road,
djinn-blooded tales keeps the old tale load.
```

5.
```text
Riatavin listens under caper and gold,
djinn-blooded tales keeps the old tale told.
```

6.
```text
Memnon listens under court and cold,
courtly spies keeps the old tale bold.
```

7.
```text
Tethyr listens under silk and night,
old pacts keeps the old tale light.
```

8.
```text
Riatavin listens under silk and flame,
old pacts keeps the old tale name.
```

9.
```text
Amn listens under spice and road,
merchant princes keeps the old tale load.
```

10.
```text
Athkatla listens under caper and sand,
djinn-blooded tales keeps the old tale hand.
```

11.
```text
Tethyr listens under court and law,
courtly spies keeps the old tale saw.
```

12.
```text
Tethyr listens under whisper and night,
courtly spies keeps the old tale light.
```

13.
```text
Calimport listens under caper and flame,
pashas keeps the old tale name.
```

14.
```text
Zazesspur listens under ledger and flame,
old pacts keeps the old tale name.
```

15.
```text
Zazesspur listens under heat haze and spice,
old pacts keeps the old tale price.
```

16.
```text
Calimport listens under ledger and flame,
old pacts keeps the old tale name.
```

17.
```text
Athkatla listens under heat haze and stone,
old pacts keeps the old tale alone.
```

18.
```text
Zazesspur listens under oath and sand,
merchant princes keeps the old tale hand.
```

19.
```text
Tethyr listens under sand and gold,
djinn-blooded tales keeps the old tale told.
```

20.
```text
Memnon listens under spice and sand,
courtly spies keeps the old tale hand.
```

21.
```text
Amn listens under court and road,
old pacts keeps the old tale load.
```

22.
```text
Amn listens under heat haze and
road, pashas keeps the old tale load.
```

23.
```text
Memnon listens under silk and gold,
courtly spies keeps the old tale told.
```

24.
```text
Riatavin listens under whisper and road,
pashas keeps the old tale load.
```

25.
```text
Memnon listens under harbor smoke and night,
old pacts keeps the old tale light.
```

26.
```text
Riatavin listens under sand and cold,
merchant princes keeps the old tale bold.
```

27.
```text
Erlkazar listens under harbor smoke and gold,
merchant princes keeps the old tale told.
```

28.
```text
Tethyr listens under ledger and road,
pashas keeps the old tale load.
```

29.
```text
Amn listens under sand and gold,
old pacts keeps the old tale told.
```

30.
```text
Erlkazar listens under court and law,
pashas keeps the old tale saw.
```

31.
```text
Iriaebor listens under oath and flame,
courtly spies keeps the old tale name.
```

32.
```text
Tethyr listens under harbor smoke and law,
djinn-blooded tales keeps the old tale saw.
```

33.
```text
Calimport listens under whisper and gold,
pashas keeps the old tale told.
```

34.
```text
Memnon listens under heat haze and spice,
merchant princes keeps the old tale price.
```

35.
```text
Erlkazar listens under whisper and law,
djinn-blooded tales keeps the old tale saw.
```

36.
```text
Amn listens under sand and cold,
merchant princes keeps the old tale bold.
```

37.
```text
Tethyr listens under heat haze and
flame, pashas keeps the old tale name.
```

38.
```text
Calimport listens under caper and stone,
djinn-blooded tales keeps the old tale alone.
```

39.
```text
Iriaebor listens under silk and night,
courtly spies keeps the old tale light.
```

40.
```text
Darromar listens under whisper and gold,
old pacts keeps the old tale told.
```

41.
```text
Athkatla listens under silk and night,
pashas keeps the old tale light.
```

42.
```text
Athkatla listens under caper and sea,
courtly spies keeps the old tale free.
```

43.
```text
Memnon listens under ledger and flame,
pashas keeps the old tale name.
```

44.
```text
Erlkazar listens under caper and flame,
old pacts keeps the old tale name.
```

45.
```text
Erlkazar listens under court and road,
merchant princes keeps the old tale load.
```

46.
```text
Tethyr listens under oath and spice,
old pacts keeps the old tale price.
```

47.
```text
Tethyr listens under ledger and night,
merchant princes keeps the old tale light.
```

48.
```text
Memnon listens under heat haze and law,
djinn-blooded tales keeps the old tale saw.
```

#### `swordcoast`

##### `quips.swordcoast.long` (38 entries)

1.
```text
Along the Sword Coast's salted spine,
Cities sharpen word and blade,
Waterdeep trades in quiet sign,
Baldur's Gate in laws well made,
Harbors teach the cost of trust,
Tides remember every lie,
What you build will stand or rust,
As ships and fortunes pass you by.
```

2.
```text
In Beregost the dock lingers into sand,
While travelers learn to measure hand,
The tavern can make the kindest spice,
And turn a proud resolve to price,
Masked Lords keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

3.
```text
In Candlekeep the salt wind lingers into snow,
While travelers learn to measure go,
The law can make the kindest rime,
And turn a proud resolve to time,
Flaming Fist keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

4.
```text
In the Fields of the Dead the law lingers into snow,
While travelers learn to measure go,
The salt wind can make the kindest rime,
And turn a proud resolve to time,
Harper songs keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

5.
```text
In Beregost the watch lingers into road,
While travelers learn to measure load,
The coin can make the kindest coin,
And turn a proud resolve to sign,
Masked Lords keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

6.
```text
In Beregost the mask lingers into snow,
While travelers learn to measure go,
The watch can make the kindest rime,
And turn a proud resolve to,
time, guildmasters keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

7.
```text
In Daggerford the law lingers into sand,
While travelers learn to measure hand,
The caravan can make the kindest spice,
And turn a proud resolve to price,
Flaming Fist keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

8.
```text
In the Fields of the Dead the coin lingers into sand,
While travelers learn to measure hand,
The festival can make the kindest spice,
And turn a proud resolve to,
price, guildmasters keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

9.
```text
In Elturel the law lingers into night,
While travelers learn to measure light,
The watch can make the kindest cold,
And turn a proud resolve to bold,
Masked Lords keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

10.
```text
In Elturel the festival lingers into road,
While travelers learn to measure load,
The watch can make the kindest coin,
And turn a proud resolve to,
sign, guildmasters keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

11.
```text
In Candlekeep the watch lingers into road,
While travelers learn to measure load,
The salt wind can make the kindest coin,
And turn a proud resolve to sign,
Harper songs keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

12.
```text
In Baldur's Gate the guild lingers into sand,
While travelers learn to measure hand,
The festival can make the kindest spice,
And turn a proud resolve to price,
Masked Lords keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

13.
```text
In the Chionthar the dock lingers into road,
While travelers learn to measure load,
The coin can make the kindest coin,
And turn a proud resolve to sign,
Harper songs keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

14.
```text
In Beregost the tavern lingers into night,
While travelers learn to measure light,
The law can make the kindest cold,
And turn a proud resolve to,
bold, guildmasters keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

15.
```text
In Baldur's Gate the tavern lingers into sand,
While travelers learn to measure hand,
The tavern can make the kindest spice,
And turn a proud resolve to price,
Harper songs keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

16.
```text
In the Mere the law lingers into road,
While travelers learn to measure load,
The tavern can make the kindest coin,
And turn a proud resolve to sign,
Harper songs keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

17.
```text
In Waterdeep the dock lingers into sand,
While travelers learn to measure hand,
The guild can make the kindest spice,
And turn a proud resolve to price,
Zhentarim whispers keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

18.
```text
In the Chionthar the dock lingers into snow,
While travelers learn to measure go,
The coin can make the kindest rime,
And turn a proud resolve to time,
Masked Lords keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

19.
```text
In the Mere the mask lingers into snow,
While travelers learn to measure go,
The mask can make the kindest rime,
And turn a proud resolve to time,
Harper songs keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

20.
```text
In the Chionthar the guild lingers into night,
While travelers learn to measure light,
The guild can make the kindest cold,
And turn a proud resolve to bold,
Harper songs keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

21.
```text
In Candlekeep the guild lingers into night,
While travelers learn to measure light,
The tavern can make the kindest cold,
And turn a proud resolve to bold,
Harper songs keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

22.
```text
In the Chionthar the mask lingers into sand,
While travelers learn to measure hand,
The law can make the kindest spice,
And turn a proud resolve to price,
Flaming Fist keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

23.
```text
In Beregost the tavern lingers into night,
While travelers learn to measure light,
The dock can make the kindest cold,
And turn a proud resolve to bold,
Harper songs keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

24.
```text
In the Trade Way the caravan lingers into road,
While travelers learn to measure load,
The guild can make the kindest coin,
And turn a proud resolve to,
sign, guildmasters keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

25.
```text
In Elturel the dock lingers into snow,
While travelers learn to measure go,
The festival can make the kindest rime,
And turn a proud resolve to time,
Flaming Fist keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

26.
```text
In Waterdeep the guild lingers into night,
While travelers learn to measure light,
The caravan can make the kindest cold,
And turn a proud resolve to bold,
Masked Lords keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

27.
```text
In Daggerford the dock lingers into snow,
While travelers learn to measure go,
The festival can make the kindest rime,
And turn a proud resolve to time,
Harper songs keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

28.
```text
In Daggerford the festival lingers into night,
While travelers learn to measure light,
The caravan can make the kindest cold,
And turn a proud resolve to,
bold, guildmasters keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

29.
```text
In Beregost the dock lingers into road,
While travelers learn to measure load,
The caravan can make the kindest coin,
And turn a proud resolve to,
sign, guildmasters keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

30.
```text
In Baldur's Gate the guild lingers into snow,
While travelers learn to measure go,
The mask can make the kindest rime,
And turn a proud resolve to time,
Harper songs keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

31.
```text
In the Fields of the Dead the caravan lingers into night,
While travelers learn to measure light,
The mask can make the kindest cold,
And turn a proud resolve to bold,
Zhentarim whispers keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

32.
```text
In the Chionthar the coin lingers into sand,
While travelers learn to measure hand,
The mask can make the kindest spice,
And turn a proud resolve to price,
Zhentarim whispers keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

33.
```text
In Waterdeep the festival lingers into road,
While travelers learn to measure load,
The guild can make the kindest coin,
And turn a proud resolve to sign,
Harper songs keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

34.
```text
In Elturel the law lingers into snow,
While travelers learn to measure go,
The mask can make the kindest rime,
And turn a proud resolve to time,
Zhentarim whispers keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

35.
```text
In Baldur's Gate the mask lingers into night,
While travelers learn to measure light,
The salt wind can make the kindest cold,
And turn a proud resolve to bold,
Flaming Fist keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

36.
```text
In the Mere the tavern lingers into night,
While travelers learn to measure light,
The law can make the kindest cold,
And turn a proud resolve to,
bold, guildmasters keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

37.
```text
In Candlekeep the dock lingers into road,
While travelers learn to measure load,
The caravan can make the kindest coin,
And turn a proud resolve to sign,
Zhentarim whispers keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

38.
```text
In Elturel the guild lingers into sand,
While travelers learn to measure hand,
The caravan can make the kindest spice,
And turn a proud resolve to price,
Masked Lords keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

##### `quips.swordcoast.medium` (42 entries)

1.
```text
Waterdeep smiles behind the Mask,
Where guilds and gods divide the day,
The city asks what you can ask,
And charges more if you should stay.
```

2.
```text
Baldur's Gate stands hard and high,
Steel laws grind mercy thin,
The Coast decides who passes by,
And what the price of entry's been.
```

3.
```text
In Candlekeep the watch draws close like gold,
And every promise bends with told,
Harper songs watches bargains held with name,
And pays the patient heart with flame.
```

4.
```text
In Candlekeep the mask draws close like fire,
And every promise bends with desire,
Flaming Fist watches bargains held with care,
And pays the patient heart with air.
```

5.
```text
In the Mere the salt wind draws close like tide,
And every promise bends with wide,
Masked Lords watches bargains held with near,
And pays the patient heart with year.
```

6.
```text
In Baldur's Gate the coin draws close like fire,
And every promise bends with desire,,
guildmasters watches bargains held with care,
And pays the patient heart with air.
```

7.
```text
In Beregost the watch draws close like snow,
And every promise bends with go,
Flaming Fist watches bargains held with true,
And pays the patient heart with through.
```

8.
```text
In the Fields of the Dead the coin draws close like gold,
And every promise bends with told,
Harper songs watches bargains held with name,
And pays the patient heart with flame.
```

9.
```text
In the Mere the law draws close like heat,
And every promise bends with sweet,
Flaming Fist watches bargains held with hand,
And pays the patient heart with land.
```

10.
```text
In the Mere the caravan draws close like fire,
And every promise bends with desire,
Flaming Fist watches bargains held with care,
And pays the patient heart with air.
```

11.
```text
In Waterdeep the caravan draws close like coin,
And every promise bends with sign,,
guildmasters watches bargains held with day,
And pays the patient heart with stay.
```

12.
```text
In the Fields of the Dead the mask draws close like coin,
And every promise bends with sign,
Zhentarim whispers watches bargains held with day,
And pays the patient heart with stay.
```

13.
```text
In the Trade Way the tavern draws close like heat,
And every promise bends with sweet,
Harper songs watches bargains held with hand,
And pays the patient heart with land.
```

14.
```text
In Beregost the tavern draws close like heat,
And every promise bends with sweet,
Flaming Fist watches bargains held with hand,
And pays the patient heart with land.
```

15.
```text
In the Fields of the Dead,
the watch draws close like tide,
And every promise bends with wide, guildmasters watches bargains held with near,
And pays the patient heart with year.
```

16.
```text
In the Fields of the Dead the festival draws close like fire,
And every promise bends with desire,
Zhentarim whispers watches bargains held with care,
And pays the patient heart with air.
```

17.
```text
In the Mere the guild draws close like fire,
And every promise bends with desire,
Harper songs watches bargains held with care,
And pays the patient heart with air.
```

18.
```text
In the Mere the tavern draws close like stone,
And every promise bends with alone,
Masked Lords watches bargains held with road,
And pays the patient heart with load.
```

19.
```text
In Baldur's Gate the guild draws close like gold,
And every promise bends with told,
Zhentarim whispers watches bargains held with name,
And pays the patient heart with flame.
```

20.
```text
In the Chionthar the guild draws close like tide,
And every promise bends with wide,,
guildmasters watches bargains held with near,
And pays the patient heart with year.
```

21.
```text
In Baldur's Gate the coin draws close like stone,
And every promise bends with alone,
Flaming Fist watches bargains held with road,
And pays the patient heart with load.
```

22.
```text
In Elturel the coin draws close like tide,
And every promise bends with wide,
Flaming Fist watches bargains held with near,
And pays the patient heart with year.
```

23.
```text
In Candlekeep the caravan draws close like stone,
And every promise bends with alone,
Masked Lords watches bargains held with road,
And pays the patient heart with load.
```

24.
```text
In the Mere the tavern draws close like gold,
And every promise bends with told,
Harper songs watches bargains held with name,
And pays the patient heart with flame.
```

25.
```text
In the Fields of the Dead the guild draws close like snow,
And every promise bends with go,
Zhentarim whispers watches bargains held with true,
And pays the patient heart with through.
```

26.
```text
In the Trade Way the salt wind draws close like tide,
And every promise bends with wide,,
guildmasters watches bargains held with near,
And pays the patient heart with year.
```

27.
```text
In the Chionthar the caravan draws close like snow,
And every promise bends with go,,
guildmasters watches bargains held with true,
And pays the patient heart with through.
```

28.
```text
In Baldur's Gate the coin draws close like stone,
And every promise bends with alone,
Zhentarim whispers watches bargains held with road,
And pays the patient heart with load.
```

29.
```text
In Waterdeep the tavern draws close like snow,
And every promise bends with go,
Masked Lords watches bargains held with true,
And pays the patient heart with through.
```

30.
```text
In Beregost the tavern draws close like snow,
And every promise bends with go,
Zhentarim whispers watches bargains held with true,
And pays the patient heart with through.
```

31.
```text
In Elturel the salt wind draws close like coin,
And every promise bends with sign,
Flaming Fist watches bargains held with day,
And pays the patient heart with stay.
```

32.
```text
In Daggerford the salt wind draws close like snow,
And every promise bends with go,
Zhentarim whispers watches bargains held with true,
And pays the patient heart with through.
```

33.
```text
In Waterdeep the caravan draws close like fire,
And every promise bends with desire,
Masked Lords watches bargains held with care,
And pays the patient heart with air.
```

34.
```text
In Daggerford the mask draws close like gold,
And every promise bends with told,,
guildmasters watches bargains held with name,
And pays the patient heart with flame.
```

35.
```text
In the Fields of the Dead the tavern draws close like stone,
And every promise bends with alone,
Masked Lords watches bargains held with road,
And pays the patient heart with load.
```

36.
```text
In Elturel the tavern draws close like fire,
And every promise bends with desire,
Zhentarim whispers watches bargains held with care,
And pays the patient heart with air.
```

37.
```text
In Candlekeep the watch draws close like coin,
And every promise bends with sign,,
guildmasters watches bargains held with day,
And pays the patient heart with stay.
```

38.
```text
In Waterdeep the dock draws close like tide,
And every promise bends with wide,
Harper songs watches bargains held with near,
And pays the patient heart with year.
```

39.
```text
In Beregost the mask draws close like tide,
And every promise bends with wide,
Harper songs watches bargains held with near,
And pays the patient heart with year.
```

40.
```text
In Beregost the dock draws close like stone,
And every promise bends with alone,
Zhentarim whispers watches bargains held with road,
And pays the patient heart with load.
```

41.
```text
In Elturel the festival draws close like gold,
And every promise bends with told,
Flaming Fist watches bargains held with name,
And pays the patient heart with flame.
```

42.
```text
In Daggerford the caravan draws close like tide,
And every promise bends with wide,
Masked Lords watches bargains held with near,
And pays the patient heart with year.
```

##### `quips.swordcoast.short` (48 entries)

1.
```text
Waterdeep counts truths in gold,
Masks keep secrets bought and sold.
```

2.
```text
Baldur's Gate weighs blood and law,
The city eats what streets once saw.
```

3.
```text
Salt spray writes the coastal creed,
Trade and tide decide the deed.
```

4.
```text
the Chionthar listens under caravan and cold,
Flaming Fist keeps the old tale bold.
```

5.
```text
Baldur's Gate listens under salt wind and spice,
Harper songs keeps the old tale price.
```

6.
```text
Beregost listens under mask and flame,
Flaming Fist keeps the old tale name.
```

7.
```text
Waterdeep listens under law and road,
Masked Lords keeps the old tale load.
```

8.
```text
Daggerford listens under festival and cold,
Masked Lords keeps the old tale bold.
```

9.
```text
Daggerford listens under dock and stone,
Masked Lords keeps the old tale alone.
```

10.
```text
the Trade Way listens under coin and sand,
Masked Lords keeps the old tale hand.
```

11.
```text
Elturel listens under coin and night,
guildmasters keeps the old tale light.
```

12.
```text
Elturel listens under guild and flame,
Zhentarim whispers keeps the old tale name.
```

13.
```text
the Mere listens under mask and road,
Masked Lords keeps the old tale load.
```

14.
```text
Beregost listens under salt wind and flame,
Harper songs keeps the old tale name.
```

15.
```text
Baldur's Gate listens under festival and night,
Flaming Fist keeps the old tale light.
```

16.
```text
Candlekeep listens under caravan and spice,
guildmasters keeps the old tale price.
```

17.
```text
Elturel listens under caravan and law,
Masked Lords keeps the old tale saw.
```

18.
```text
Beregost listens under caravan and cold,
guildmasters keeps the old tale bold.
```

19.
```text
Daggerford listens under law and sea,
Flaming Fist keeps the old tale free.
```

20.
```text
Daggerford listens under caravan and cold,
guildmasters keeps the old tale bold.
```

21.
```text
the Trade Way listens under salt wind and spice,
Flaming Fist keeps the old tale price.
```

22.
```text
Elturel listens under salt wind and law,
Flaming Fist keeps the old tale saw.
```

23.
```text
Elturel listens under coin and cold,
guildmasters keeps the old tale bold.
```

24.
```text
Waterdeep listens under dock and cold,
Masked Lords keeps the old tale bold.
```

25.
```text
the Mere listens under tavern and flame,
Zhentarim whispers keeps the old tale name.
```

26.
```text
Candlekeep listens under law and stone,
Harper songs keeps the old tale alone.
```

27.
```text
Candlekeep listens under tavern and gold,
Zhentarim whispers keeps the old tale told.
```

28.
```text
Elturel listens under festival and sea,
guildmasters keeps the old tale free.
```

29.
```text
Candlekeep listens under festival and cold,
Zhentarim whispers keeps the old tale bold.
```

30.
```text
the Mere listens under salt wind and law,
Masked Lords keeps the old tale saw.
```

31.
```text
Candlekeep listens under mask and night,
guildmasters keeps the old tale light.
```

32.
```text
Daggerford listens under watch and flame,
guildmasters keeps the old tale name.
```

33.
```text
Waterdeep listens under coin and sand,
Flaming Fist keeps the old tale hand.
```

34.
```text
Candlekeep listens under caravan and night,
Flaming Fist keeps the old tale light.
```

35.
```text
Daggerford listens under coin and stone,
Flaming Fist keeps the old tale alone.
```

36.
```text
Beregost listens under salt wind and gold,
Harper songs keeps the old tale told.
```

37.
```text
Beregost listens under guild and cold,
Masked Lords keeps the old tale bold.
```

38.
```text
the Mere listens under dock and gold,
Masked Lords keeps the old tale told.
```

39.
```text
Elturel listens under mask and road,
Masked Lords keeps the old tale load.
```

40.
```text
Daggerford listens under guild and spice,
Masked Lords keeps the old tale price.
```

41.
```text
Elturel listens under watch and flame,
Masked Lords keeps the old tale name.
```

42.
```text
the Mere listens under coin and
road, guildmasters keeps the old tale load.
```

43.
```text
the Chionthar listens under mask and sea,
Masked Lords keeps the old tale free.
```

44.
```text
Elturel listens under coin and road,
Harper songs keeps the old tale load.
```

45.
```text
Daggerford listens under mask and law,
Zhentarim whispers keeps the old tale saw.
```

46.
```text
Baldur's Gate listens under dock and flame,
Masked Lords keeps the old tale name.
```

47.
```text
Waterdeep listens under law and gold,
Zhentarim whispers keeps the old tale told.
```

48.
```text
Beregost listens under coin and stone,
Flaming Fist keeps the old tale alone.
```

#### `swordcoastnorth`

##### `quips.swordcoastnorth.long` (45 entries)

1.
```text
From Luskan's docks to Neverwinter's steam,
The North sells chances, buys resolve,
Old ruins whisper broken dreams,
That only stubborn hands can solve,
Caravans count blades and bread,
The High Road knows what oaths are worth,
What falls is mourned, what stands is said,
In northern coin of grit and hearth.
```

2.
```text
In Luskan the harbor lingers into sand,
While travelers learn to measure hand,
The smoke can make the kindest spice,
And turn a proud resolve to price,,
pirate captains keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

3.
```text
In the High Road the ruin lingers into snow,
While travelers learn to measure go,
The ruin can make the kindest rime,
And turn a proud resolve to time, orcs,
of the north keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

4.
```text
In Longsaddle the caravan lingers into snow,
While travelers learn to measure go,
The road dust can make the kindest rime,
And turn a proud resolve to time,,
the Arcane Brotherhood keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

5.
```text
In the Mere of Dead Men the rebuild lingers into road,
While travelers learn to measure load,
The smoke can make the kindest coin,
And turn a proud resolve to sign,,
the Arcane Brotherhood keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

6.
```text
In Mirabar the stone bridge lingers into road,
While travelers learn to measure load,
The ruin can make the kindest coin,
And turn a proud resolve to sign,,
old kings keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

7.
```text
In Luskan the harbor lingers into night,
While travelers learn to measure light,
The road dust can make the kindest cold,
And turn a proud resolve to bold,,
pirate captains keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

8.
```text
In Triboar the road dust lingers into snow,
While travelers learn to measure go,
The harbor can make the kindest rime,
And turn a proud resolve to time,,
the Arcane Brotherhood keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

9.
```text
In Helm's Hold the road dust lingers into road,
While travelers learn to measure load,
The smoke can make the kindest coin,
And turn a proud resolve to sign, orcs,
of the north keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

10.
```text
In Gauntlgrym the stone bridge lingers into night,
While travelers learn to measure light,
The ruin can make the kindest cold,
And turn a proud resolve to bold,,
pirate captains keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

11.
```text
In Helm's Hold the road dust lingers into snow,
While travelers learn to measure go,
The guild can make the kindest rime,
And turn a proud resolve to time,,
the Arcane Brotherhood keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

12.
```text
In the High Road the pirate lingers into sand,
While travelers learn to measure hand,
The sea fog can make the kindest spice,
And turn a proud resolve to price,,
the Arcane Brotherhood keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

13.
```text
In Neverwinter the stone bridge lingers into sand,
While travelers learn to measure hand,
The caravan can make the kindest spice,
And turn a proud resolve to price,,
mercenary companies keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

14.
```text
In Gauntlgrym the stone bridge lingers into sand,
While travelers learn to measure hand,
The smoke can make the kindest spice,
And turn a proud resolve to price,,
old kings keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

15.
```text
In Triboar the smoke lingers into night,
While travelers learn to measure light,
The smoke can make the kindest cold,
And turn a proud resolve to bold, orcs,
of the north keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

16.
```text
In Luskan the ruin lingers into sand,
While travelers learn to measure hand,
The guild can make the kindest spice,
And turn a proud resolve to price,,
the Arcane Brotherhood keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

17.
```text
In Triboar the road dust lingers into road,
While travelers learn to measure load,
The stone bridge can make the kindest coin,
And turn a proud resolve to sign,,
pirate captains keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

18.
```text
In Yartar the caravan lingers into sand,
While travelers learn to measure hand,
The guild can make the kindest spice,
And turn a proud resolve to price,,
mercenary companies keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

19.
```text
In Gauntlgrym the road dust lingers into snow,
While travelers learn to measure go,
The stone bridge can make the kindest rime,
And turn a proud resolve to time,,
pirate captains keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

20.
```text
In Luskan the guild lingers into night,
While travelers learn to measure light,
The rebuild can make the kindest cold,
And turn a proud resolve to bold,,
old kings keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

21.
```text
In the High Road the road dust lingers into sand,
While travelers learn to measure hand,
The guild can make the kindest spice,
And turn a proud resolve to price,,
mercenary companies keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

22.
```text
In Luskan the stone bridge lingers into sand,
While travelers learn to measure hand,
The guild can make the kindest spice,
And turn a proud resolve to price,,
pirate captains keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

23.
```text
In Luskan the road dust lingers into night,
While travelers learn to measure light,
The smoke can make the kindest cold,
And turn a proud resolve to bold, orcs,
of the north keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

24.
```text
In Gauntlgrym the guild lingers into road,
While travelers learn to measure load,
The ruin can make the kindest coin,
And turn a proud resolve to sign,,
pirate captains keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

25.
```text
In Yartar the caravan lingers into road,
While travelers learn to measure load,
The rebuild can make the kindest coin,
And turn a proud resolve to sign,,
pirate captains keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

26.
```text
In Longsaddle the sea fog lingers into night,
While travelers learn to measure light,
The road dust can make the kindest cold,
And turn a proud resolve to bold,,
old kings keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

27.
```text
In the High Road the stone bridge lingers into road,
While travelers learn to measure load,
The guild can make the kindest coin,
And turn a proud resolve to sign,,
old kings keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

28.
```text
In Luskan the caravan lingers into snow,
While travelers learn to measure go,
The ruin can make the kindest rime,
And turn a proud resolve to time,,
the Arcane Brotherhood keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

29.
```text
In Yartar the caravan lingers into night,
While travelers learn to measure light,
The ruin can make the kindest cold,
And turn a proud resolve to bold, orcs,
of the north keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

30.
```text
In Neverwinter the rebuild lingers into snow,
While travelers learn to measure go,
The guild can make the kindest rime,
And turn a proud resolve to time,,
old kings keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

31.
```text
In the Mere of Dead Men the caravan lingers into snow,
While travelers learn to measure go,
The harbor can make the kindest rime,
And turn a proud resolve to time,,
mercenary companies keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

32.
```text
In the High Road the smoke lingers into snow,
While travelers learn to measure go,
The ruin can make the kindest rime,
And turn a proud resolve to time,,
pirate captains keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

33.
```text
In Longsaddle the caravan lingers into night,
While travelers learn to measure light,
The stone bridge can make the kindest cold,
And turn a proud resolve to bold,,
the Arcane Brotherhood keeps counsel by the sea,
And tests each vow that claims it's free,
Those who endure will carve new stone,
And leave the road a little less alone.
```

34.
```text
In Mirabar the smoke lingers into snow,
While travelers learn to measure go,
The pirate can make the kindest rime,
And turn a proud resolve to time,,
the Arcane Brotherhood keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

35.
```text
In the Mere of Dead Men the caravan lingers into road,
While travelers learn to measure load,
The stone bridge can make the kindest coin,
And turn a proud resolve to sign, orcs,
of the north keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

36.
```text
In Mirabar the caravan lingers into road,
While travelers learn to measure load,
The stone bridge can make the kindest coin,
And turn a proud resolve to sign,,
the Arcane Brotherhood keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

37.
```text
In the High Road the sea fog lingers into snow,
While travelers learn to measure go,
The stone bridge can make the kindest rime,
And turn a proud resolve to time, orcs,
of the north keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

38.
```text
In Triboar the caravan lingers into sand,
While travelers learn to measure hand,
The rebuild can make the kindest spice,
And turn a proud resolve to price,,
pirate captains keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

39.
```text
In Luskan the guild lingers into snow,
While travelers learn to measure go,
The stone bridge can make the kindest rime,
And turn a proud resolve to time, orcs,
of the north keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

40.
```text
In Helm's Hold the smoke lingers into sand,
While travelers learn to measure hand,
The guild can make the kindest spice,
And turn a proud resolve to price,,
pirate captains keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

41.
```text
In Luskan the rebuild lingers into sand,
While travelers learn to measure hand,
The guild can make the kindest spice,
And turn a proud resolve to price,,
old kings keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

42.
```text
In Neverwinter the road dust lingers into snow,
While travelers learn to measure go,
The harbor can make the kindest rime,
And turn a proud resolve to time,,
mercenary companies keeps counsel by the wind,
And tests each vow that claims it's pinned,
Those who endure will carve new heart,
And leave the road a little less start.
```

43.
```text
In Mirabar the ruin lingers into road,
While travelers learn to measure load,
The guild can make the kindest coin,
And turn a proud resolve to sign, orcs,
of the north keeps counsel by the law,
And tests each vow that claims it's saw,
Those who endure will carve new true,
And leave the road a little less through.
```

44.
```text
In Triboar the road dust lingers into sand,
While travelers learn to measure hand,
The ruin can make the kindest spice,
And turn a proud resolve to price,,
the Arcane Brotherhood keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

45.
```text
In Gauntlgrym the sea fog lingers into sand,
While travelers learn to measure hand,
The sea fog can make the kindest spice,
And turn a proud resolve to price,,
mercenary companies keeps counsel by the oath,
And tests each vow that claims it's wroth,
Those who endure will carve new name,
And leave the road a little less flame.
```

##### `quips.swordcoastnorth.medium` (41 entries)

1.
```text
Neverwinter heals where fire runs,
Stone remembers shattered years,
The North trades hope by rising suns,
And pays in scars instead of tears.
```

2.
```text
Luskan's towers lean and grin,
Pirate kings and quiet deals,
The sea keeps what it drags within,
And northbound truth is what it steals.
```

3.
```text
In Helm's Hold the rebuild draws close like tide,
And every promise bends with wide,,
old kings watches bargains held with near,
And pays the patient heart with year.
```

4.
```text
In the Mere of Dead Men the caravan draws close like snow,
And every promise bends with go, the,
Arcane Brotherhood watches bargains held with true,
And pays the patient heart with through.
```

5.
```text
In the High Road the stone bridge draws close like coin,
And every promise bends with sign, orcs,
of the north watches bargains held with day,
And pays the patient heart with stay.
```

6.
```text
In Neverwinter the guild draws close like coin,
And every promise bends with sign,,
old kings watches bargains held with day,
And pays the patient heart with stay.
```

7.
```text
In Triboar the road dust draws close like heat,
And every promise bends with sweet, the,
Arcane Brotherhood watches bargains held with hand,
And pays the patient heart with land.
```

8.
```text
In Mirabar the caravan draws close like gold,
And every promise bends with told,,
mercenary companies watches bargains held with name,
And pays the patient heart with flame.
```

9.
```text
In Neverwinter the ruin draws close like heat,
And every promise bends with sweet, orcs,
of the north watches bargains held with hand,
And pays the patient heart with land.
```

10.
```text
In Triboar the harbor draws close like stone,
And every promise bends with alone, orcs,
of the north watches bargains held with road,
And pays the patient heart with load.
```

11.
```text
In Neverwinter the rebuild draws close like snow,
And every promise bends with go,,
old kings watches bargains held with true,
And pays the patient heart with through.
```

12.
```text
In Gauntlgrym the stone bridge draws close like fire,
And every promise bends with desire,,
mercenary companies watches bargains held with care,
And pays the patient heart with air.
```

13.
```text
In Neverwinter the rebuild draws close like tide,
And every promise bends with wide,,
old kings watches bargains held with near,
And pays the patient heart with year.
```

14.
```text
In Yartar the harbor draws close like coin,
And every promise bends with sign,,
mercenary companies watches bargains held with day,
And pays the patient heart with stay.
```

15.
```text
In Yartar the guild draws close like stone,
And every promise bends with alone, the,
Arcane Brotherhood watches bargains held with road,
And pays the patient heart with load.
```

16.
```text
In Gauntlgrym the rebuild draws close like heat,
And every promise bends with sweet,,
old kings watches bargains held with hand,
And pays the patient heart with land.
```

17.
```text
In Helm's Hold the guild draws close like fire,
And every promise bends with desire, the,
Arcane Brotherhood watches bargains held with care,
And pays the patient heart with air.
```

18.
```text
In Gauntlgrym the pirate draws close like coin,
And every promise bends with sign, orcs,
of the north watches bargains held with day,
And pays the patient heart with stay.
```

19.
```text
In Neverwinter the guild draws close like gold,
And every promise bends with told,,
mercenary companies watches bargains held with name,
And pays the patient heart with flame.
```

20.
```text
In Mirabar the ruin draws close like fire,
And every promise bends with desire, the,
Arcane Brotherhood watches bargains held with care,
And pays the patient heart with air.
```

21.
```text
In Triboar the road dust draws close like tide,
And every promise bends with wide,,
mercenary companies watches bargains held with near,
And pays the patient heart with year.
```

22.
```text
In the High Road the rebuild draws close like snow,
And every promise bends with go, the,
Arcane Brotherhood watches bargains held with true,
And pays the patient heart with through.
```

23.
```text
In Helm's Hold the harbor draws close like heat,
And every promise bends with sweet,,
mercenary companies watches bargains held with hand,
And pays the patient heart with land.
```

24.
```text
In Longsaddle the ruin draws close like fire,
And every promise bends with desire,,
pirate captains watches bargains held with care,
And pays the patient heart with air.
```

25.
```text
In the Mere of Dead Men the harbor draws close like stone,
And every promise bends with alone,,
pirate captains watches bargains held with road,
And pays the patient heart with load.
```

26.
```text
In Helm's Hold the caravan draws close like fire,
And every promise bends with desire,,
mercenary companies watches bargains held with care,
And pays the patient heart with air.
```

27.
```text
In Triboar the smoke draws close like gold,
And every promise bends with told,,
pirate captains watches bargains held with name,
And pays the patient heart with flame.
```

28.
```text
In the Mere of Dead Men the rebuild draws close like stone,
And every promise bends with alone,,
mercenary companies watches bargains held with road,
And pays the patient heart with load.
```

29.
```text
In the High Road the road dust draws close like stone,
And every promise bends with alone,,
mercenary companies watches bargains held with road,
And pays the patient heart with load.
```

30.
```text
In Yartar the harbor draws close like gold,
And every promise bends with told, orcs,
of the north watches bargains held with name,
And pays the patient heart with flame.
```

31.
```text
In Mirabar the sea fog draws close like coin,
And every promise bends with sign, orcs,
of the north watches bargains held with day,
And pays the patient heart with stay.
```

32.
```text
In Longsaddle the harbor draws close like gold,
And every promise bends with told,,
old kings watches bargains held with name,
And pays the patient heart with flame.
```

33.
```text
In Mirabar the pirate draws close like snow,
And every promise bends with go,,
pirate captains watches bargains held with true,
And pays the patient heart with through.
```

34.
```text
In Luskan the road dust draws close like fire,
And every promise bends with desire,,
pirate captains watches bargains held with care,
And pays the patient heart with air.
```

35.
```text
In Yartar the stone bridge draws close like gold,
And every promise bends with told, the,
Arcane Brotherhood watches bargains held with name,
And pays the patient heart with flame.
```

36.
```text
In Triboar the caravan draws close like fire,
And every promise bends with desire, orcs,
of the north watches bargains held with care,
And pays the patient heart with air.
```

37.
```text
In Longsaddle the guild draws close like heat,
And every promise bends with sweet, the,
Arcane Brotherhood watches bargains held with hand,
And pays the patient heart with land.
```

38.
```text
In Mirabar the pirate draws close like tide,
And every promise bends with wide,,
old kings watches bargains held with near,
And pays the patient heart with year.
```

39.
```text
In Helm's Hold the road dust draws close like heat,
And every promise bends with sweet,,
pirate captains watches bargains held with hand,
And pays the patient heart with land.
```

40.
```text
In Mirabar the stone bridge draws close like heat,
And every promise bends with sweet, orcs,
of the north watches bargains held with hand,
And pays the patient heart with land.
```

41.
```text
In Longsaddle the sea fog draws close like tide,
And every promise bends with wide, orcs,
of the north watches bargains held with near,
And pays the patient heart with year.
```

##### `quips.swordcoastnorth.short` (47 entries)

1.
```text
Neverwinter steams against the cold,
Where ruin learns to live and hold.
```

2.
```text
Luskan laughs with knives and oars,
The sea keeps ledgers of its wars.
```

3.
```text
High Road dust and daggered smiles,
Northbound trade remembers miles.
```

4.
```text
Neverwinter listens under caravan and road,
old kings keeps the old tale load.
```

5.
```text
Helm's Hold listens under stone bridge and
sand, old kings keeps the old tale hand.
```

6.
```text
Triboar listens under caravan and spice,
pirate captains keeps the old tale price.
```

7.
```text
Yartar listens under guild and stone,
mercenary companies keeps the old tale alone.
```

8.
```text
the Mere of Dead Men listens under ruin and
gold, orcs of the north keeps the old tale told.
```

9.
```text
Gauntlgrym listens under pirate and sea, orcs
of the north keeps the old tale free.
```

10.
```text
Neverwinter listens under stone bridge and spice,
the Arcane Brotherhood keeps the old tale price.
```

11.
```text
the High Road listens under harbor and
spice, mercenary companies keeps the old tale price.
```

12.
```text
Neverwinter listens under sea fog and stone,
the Arcane Brotherhood keeps the old tale alone.
```

13.
```text
the High Road listens under road dust and
night, the Arcane Brotherhood keeps the old tale light.
```

14.
```text
Longsaddle listens under stone bridge and gold, orcs
of the north keeps the old tale told.
```

15.
```text
Luskan listens under pirate and spice, the
Arcane Brotherhood keeps the old tale price.
```

16.
```text
Luskan listens under guild and sea, orcs
of the north keeps the old tale free.
```

17.
```text
the High Road listens under harbor and
night, pirate captains keeps the old tale light.
```

18.
```text
Longsaddle listens under rebuild and night,
mercenary companies keeps the old tale light.
```

19.
```text
Luskan listens under pirate and cold,
pirate captains keeps the old tale bold.
```

20.
```text
Longsaddle listens under road dust and night,
the Arcane Brotherhood keeps the old tale light.
```

21.
```text
Longsaddle listens under rebuild and sand,
old kings keeps the old tale hand.
```

22.
```text
the High Road listens under guild and
law, old kings keeps the old tale saw.
```

23.
```text
the Mere of Dead Men listens under rebuild
and cold, pirate captains keeps the old tale bold.
```

24.
```text
the Mere of Dead Men listens under road dust
and law, pirate captains keeps the old tale saw.
```

25.
```text
the High Road listens under caravan and
spice, pirate captains keeps the old tale price.
```

26.
```text
Triboar listens under smoke and sea,
mercenary companies keeps the old tale free.
```

27.
```text
Helm's Hold listens under guild and flame,
pirate captains keeps the old tale name.
```

28.
```text
the Mere of Dead Men listens under rebuild
and cold, mercenary companies keeps the old tale bold.
```

29.
```text
Yartar listens under guild and gold,
pirate captains keeps the old tale told.
```

30.
```text
Gauntlgrym listens under sea fog and road,
pirate captains keeps the old tale load.
```

31.
```text
the Mere of Dead Men listens under stone bridge
and road, mercenary companies keeps the old tale load.
```

32.
```text
Gauntlgrym listens under caravan and flame,
pirate captains keeps the old tale name.
```

33.
```text
Neverwinter listens under rebuild and night, orcs
of the north keeps the old tale light.
```

34.
```text
Mirabar listens under pirate and cold,
old kings keeps the old tale bold.
```

35.
```text
Triboar listens under rebuild and road,
mercenary companies keeps the old tale load.
```

36.
```text
Yartar listens under stone bridge and road, orcs
of the north keeps the old tale load.
```

37.
```text
Luskan listens under harbor and road,
old kings keeps the old tale load.
```

38.
```text
Neverwinter listens under stone bridge and stone,
old kings keeps the old tale alone.
```

39.
```text
Gauntlgrym listens under sea fog and sand,
the Arcane Brotherhood keeps the old tale hand.
```

40.
```text
Luskan listens under caravan and flame, orcs
of the north keeps the old tale name.
```

41.
```text
Longsaddle listens under caravan and night,
pirate captains keeps the old tale light.
```

42.
```text
Luskan listens under harbor and flame,
old kings keeps the old tale name.
```

43.
```text
the Mere of Dead Men listens under ruin and
law, the Arcane Brotherhood keeps the old tale saw.
```

44.
```text
Helm's Hold listens under smoke and spice,
pirate captains keeps the old tale price.
```

45.
```text
Luskan listens under smoke and sand,
old kings keeps the old tale hand.
```

46.
```text
Luskan listens under guild and sand, the
Arcane Brotherhood keeps the old tale hand.
```

47.
```text
Neverwinter listens under road dust and cold, orcs
of the north keeps the old tale bold.
```

## Weather Module

Source: `Modules/fts_weather_0.2.0-alpha.1.js`

- Fallback weather quip pools: 25
- Built-in critical events: 19
- Unique critical-event effect descriptors: 69

### Fallback Weather Quips

#### `quips.weather.frozenfar.coastal` (1 entries)

1.
```text
Snow crusts the shore, smoke hangs low, and the cold reaches straight through stone.
```

#### `quips.weather.frozenfar.inland` (1 entries)

1.
```text
Hard frost grips the road, the pines creak, and every breath comes out white.
```

#### `quips.weather.frozenfar.offshore` (1 entries)

1.
```text
Pack ice grinds through dark water and the wind bites through every layer.
```

#### `quips.weather.frozenfar.underdark` (1 entries)

1.
```text
Stone sweats in the dark, distant drafts move through the tunnels, and the cold never truly leaves.
```

#### `quips.weather.frozenfar.underwater` (1 entries)

1.
```text
Ice-muted water presses in from every side, and every current feels sharper than the last.
```

#### `quips.weather.landsofintrigue.coastal` (1 entries)

1.
```text
Sea wind carries heat, spice, and dust through ports where sunshine and storms share the same sky.
```

#### `quips.weather.landsofintrigue.inland` (1 entries)

1.
```text
Dry heat settles over courtyards and roads until the air shifts and distant thunder promises relief.
```

#### `quips.weather.landsofintrigue.offshore` (1 entries)

1.
```text
Warm bright water flashes under the sun until a sudden squall sweeps over it.
```

#### `quips.weather.landsofintrigue.underdark` (1 entries)

1.
```text
The heat softens in the deep, but the stone still holds a dry pressure broken by rare cool drafts.
```

#### `quips.weather.landsofintrigue.underwater` (1 entries)

1.
```text
Warm water lies heavy over the shelf, hazed by silt and bright with sudden shifts in the current.
```

#### `quips.weather.moonshaes.coastal` (1 entries)

1.
```text
Rain-dark stone and brine-soaked air frame a shore where the sea is never quiet for long.
```

#### `quips.weather.moonshaes.inland` (1 entries)

1.
```text
The hills stay damp, the woods hold mist, and the weather feels old and heavy with rain.
```

#### `quips.weather.moonshaes.offshore` (1 entries)

1.
```text
Restless green water, fast weather, and hard wind make every sail feel one gust from trouble.
```

#### `quips.weather.moonshaes.underdark` (1 entries)

1.
```text
The deep earth holds a wet chill here, with drifting mist and cavern winds that never quite settle.
```

#### `quips.weather.moonshaes.underwater` (1 entries)

1.
```text
Kelp-dark water folds over rock and ruin while the current tugs at everything not anchored fast.
```

#### `quips.weather.swordcoast.coastal` (1 entries)

1.
```text
Salt air and harbor noise carry on the breeze while clouds gather and break without warning.
```

#### `quips.weather.swordcoast.inland` (1 entries)

1.
```text
Rolling fields and trade roads sit under broad skies where rain and wind arrive in steady turns.
```

#### `quips.weather.swordcoast.offshore` (1 entries)

1.
```text
Sea mist rides the swells, gulls wheel overhead, and the weather never feels settled for long.
```

#### `quips.weather.swordcoast.underdark` (1 entries)

1.
```text
The deep air is still but never dead, carrying mineral damp and the hint of unseen chambers ahead.
```

#### `quips.weather.swordcoast.underwater` (1 entries)

1.
```text
Green water shifts around wreck-stone and reef, and the tide carries a constant uneasy pull.
```

#### `quips.weather.swordcoastnorth.coastal` (1 entries)

1.
```text
Wet wind drives in from the sea and the harbor smells of rain, rope, and cold timber.
```

#### `quips.weather.swordcoastnorth.inland` (1 entries)

1.
```text
Chill air moves through the high country and the weather turns fast between pine, rock, and road.
```

#### `quips.weather.swordcoastnorth.offshore` (1 entries)

1.
```text
Cold gray swells roll under a sharp salt wind and the horizon stays iron-colored.
```

#### `quips.weather.swordcoastnorth.underdark` (1 entries)

1.
```text
Deep passages breathe damp air through old stone, and every echo makes the caverns feel larger.
```

#### `quips.weather.swordcoastnorth.underwater` (1 entries)

1.
```text
The water is dark, cold, and restless, with currents that feel stronger than they look.
```

### Critical Event Summaries and Effect Descriptors

#### `ashfall`

- Name: `Ashfall`
- Category: `geologic`
- Environments: `surface`
- Summary: Volcanic ash chokes the air and smothers visibility.
- `light` effects: `lightly obscured`, `surfaces slick with ash`
- `moderate` effects: `lightly obscured`, `surfaces slick with ash`, `breathing is difficult`
- `heavy` effects: `lightly obscured`, `surfaces slick with ash`, `breathing is difficult`, `difficult terrain`
- `severe` effects: `lightly obscured`, `surfaces slick with ash`, `breathing is difficult`, `difficult terrain`, `roofs risk collapse under ash`

#### `blizzard`

- Name: `Blizzard`
- Category: `storm`
- Environments: `surface`
- Summary: Driving snow and biting wind choke roads and sightlines.
- `light` effects: `lightly obscured`, `difficult terrain`
- `moderate` effects: `lightly obscured`, `difficult terrain`, `navigation at disadvantage`
- `heavy` effects: `lightly obscured`, `difficult terrain`, `travel pace reduced`
- `severe` effects: `lightly obscured`, `difficult terrain`, `travel pace reduced`, `exposed creatures risk exhaustion`

#### `cave_in`

- Name: `Cave-In`
- Category: `geologic`
- Environments: `subterranean`
- Summary: Stone and dust crash down, blocking passages and bruising bodies.
- `light` effects: `passage partly blocked`, `dust lightly obscures`
- `moderate` effects: `passage blocked`, `dust lightly obscures`, `difficult terrain`
- `heavy` effects: `passage blocked`, `dust lightly obscures`, `difficult terrain`, `secondary collapse risk`
- `severe` effects: `passage blocked`, `dust lightly obscures`, `difficult terrain`, `secondary collapse risk`, `routes must be rerouted`

#### `earthquake`

- Name: `Earthquake`
- Category: `geologic`
- Environments: `surface`, `subterranean`, `underwater`
- Summary: The ground heaves, splits, and topples weakened structures.
- `light` effects: `creatures may fall prone`, `minor cracks and slides`
- `moderate` effects: `creatures may fall prone`, `minor fissures`, `loose stone becomes difficult terrain`
- `heavy` effects: `creatures may fall prone`, `fissures open`, `cave-ins or landslides possible`
- `severe` effects: `creatures may fall prone`, `fissures open`, `structures collapse`, `cave-ins or landslides possible`

#### `flash_flood`

- Name: `Flash Flood`
- Category: `water`
- Environments: `surface`
- Summary: A sudden rush of water swallows roads, ravines, and camps.
- `light` effects: `difficult terrain`, `low crossings blocked`
- `moderate` effects: `difficult terrain`, `low crossings blocked`, `creatures may be swept away`
- `heavy` effects: `difficult terrain`, `creatures may be swept away`, `roads washed out`
- `severe` effects: `difficult terrain`, `creatures may be swept away`, `roads washed out`, `settlements flooded`

#### `heat_wave`

- Name: `Heat Wave`
- Category: `temperature`
- Environments: `surface`, `subterranean`
- Summary: Oppressive heat drains water, stamina, and concentration.
- `light` effects: `extreme heat exposure`
- `moderate` effects: `extreme heat exposure`, `water demand increased`
- `heavy` effects: `extreme heat exposure`, `water demand increased`, `travel pace reduced`
- `severe` effects: `extreme heat exposure`, `water demand increased`, `travel pace reduced`, `wildfire risk`

#### `hurricane`

- Name: `Hurricane`
- Category: `storm`
- Environments: `surface`
- Summary: A massive rotating storm devastates coastlines and sea lanes.
- `light` effects: `strong wind`, `lightly obscured`, `storm surge risk`
- `moderate` effects: `strong wind`, `lightly obscured`, `storm surge risk`, `travel pace reduced`
- `heavy` effects: `strong wind`, `lightly obscured`, `storm surge risk`, `travel pace reduced`, `structures damaged`
- `severe` effects: `strong wind`, `lightly obscured`, `storm surge risk`, `travel pace reduced`, `structures damaged`, `coastal flooding`

#### `ice_storm`

- Name: `Ice Storm`
- Category: `storm`
- Environments: `surface`
- Summary: Freezing hail and sleet turn open ground treacherous.
- `light` effects: `slippery ground`, `lightly obscured`
- `moderate` effects: `slippery ground`, `lightly obscured`, `difficult terrain`
- `heavy` effects: `slippery ground`, `difficult terrain`, `visibility reduced`
- `severe` effects: `slippery ground`, `difficult terrain`, `visibility reduced`, `structures take icing stress`

#### `maelstrom`

- Name: `Maelstrom`
- Category: `marine`
- Environments: `surface`, `underwater`
- Summary: A violent whirlpool drags ships and swimmers toward its heart.
- `light` effects: `forced movement toward center`, `rough water`
- `moderate` effects: `forced movement toward center`, `rough water`, `small craft endangered`
- `heavy` effects: `forced movement toward center`, `rough water`, `small craft endangered`, `visibility reduced underwater`
- `severe` effects: `forced movement toward center`, `rough water`, `small craft endangered`, `visibility reduced underwater`, `capsize risk`

#### `rogue_wave`

- Name: `Rogue Wave`
- Category: `marine`
- Environments: `surface`, `underwater`
- Summary: A sudden wall of water smashes through ships, reefs, and shallows.
- `light` effects: `creatures knocked prone`, `deck footing hazardous`
- `moderate` effects: `creatures knocked prone`, `deck footing hazardous`, `small craft swamped`
- `heavy` effects: `creatures knocked prone`, `small craft swamped`, `wreckage creates difficult terrain`
- `severe` effects: `creatures knocked prone`, `small craft swamped`, `wreckage creates difficult terrain`, `capsize risk`

#### `sandstorm`

- Name: `Sandstorm`
- Category: `storm`
- Environments: `surface`
- Summary: Blasting grit erodes sight, breath, and exposed skin.
- `light` effects: `lightly obscured`, `Perception at disadvantage`
- `moderate` effects: `lightly obscured`, `Perception at disadvantage`, `difficult terrain`
- `heavy` effects: `lightly obscured`, `difficult terrain`, `ranged attacks at disadvantage`
- `severe` effects: `lightly obscured`, `difficult terrain`, `ranged attacks at disadvantage`, `travel halted in open desert`

#### `sea_storm`

- Name: `Sea Storm`
- Category: `storm`
- Environments: `surface`, `underwater`
- Summary: Heavy seas and violent weather punish coastlines and open water.
- `light` effects: `rough seas`, `lightly obscured`
- `moderate` effects: `rough seas`, `lightly obscured`, `small craft endangered`
- `heavy` effects: `heavy seas`, `lightly obscured`, `small craft endangered`
- `severe` effects: `heavy seas`, `lightly obscured`, `small craft endangered`, `capsize risk`

#### `sinkhole`

- Name: `Sinkhole`
- Category: `geologic`
- Environments: `surface`, `subterranean`
- Summary: The ground suddenly drops away beneath roads, camps, and fields.
- `light` effects: `small depression forms`, `ground unstable`
- `moderate` effects: `ground unstable`, `difficult terrain`
- `heavy` effects: `ground unstable`, `difficult terrain`, `travel route cut`
- `severe` effects: `ground unstable`, `difficult terrain`, `travel route cut`, `structures collapse into sinkhole`

#### `thunderstorm`

- Name: `Thunderstorm`
- Category: `storm`
- Environments: `surface`
- Summary: Thunder, lightning, and hard rain sweep across the region.
- `light` effects: `lightly obscured`, `Perception at disadvantage`
- `moderate` effects: `lightly obscured`, `Perception at disadvantage`, `open flames extinguished`
- `heavy` effects: `lightly obscured`, `open flames extinguished`, `ranged attacks at disadvantage`
- `severe` effects: `lightly obscured`, `open flames extinguished`, `ranged attacks at disadvantage`, `flash flooding possible`

#### `tornado`

- Name: `Tornado`
- Category: `storm`
- Environments: `surface`
- Summary: A violent funnel tears across the ground with little warning.
- `light` effects: `flying debris`, `creatures knocked prone`
- `moderate` effects: `flying debris`, `creatures knocked prone`, `difficult terrain from wreckage`
- `heavy` effects: `flying debris`, `creatures knocked prone`, `structures damaged`
- `severe` effects: `flying debris`, `creatures knocked prone`, `structures destroyed`, `difficult terrain from wreckage`

#### `toxic_fog`

- Name: `Toxic Fog`
- Category: `atmospheric`
- Environments: `surface`, `subterranean`
- Summary: A choking vapor cloud blankets the area.
- `light` effects: `lightly obscured`, `breathing is difficult`
- `moderate` effects: `lightly obscured`, `breathing is difficult`, `difficult terrain`
- `heavy` effects: `lightly obscured`, `breathing is difficult`, `difficult terrain`, `open flames sputter`
- `severe` effects: `lightly obscured`, `breathing is difficult`, `difficult terrain`, `routes become impassable without protection`

#### `volcanic_eruption`

- Name: `Volcanic Eruption`
- Category: `geologic`
- Environments: `surface`
- Summary: Ash, lava, and shockwaves transform the local terrain.
- `light` effects: `ash lightly obscures`, `difficult terrain from ash`
- `moderate` effects: `ash lightly obscures`, `difficult terrain from ash`, `air becomes hazardous`
- `heavy` effects: `ash lightly obscures`, `difficult terrain from ash`, `air becomes hazardous`, `lava channels block routes`
- `severe` effects: `ash lightly obscures`, `difficult terrain from ash`, `air becomes hazardous`, `lava channels block routes`, `settlements threatened`

#### `wildfire`

- Name: `Wildfire`
- Category: `fire`
- Environments: `surface`
- Summary: Wind-driven flame and smoke race through dry terrain.
- `light` effects: `smoke lightly obscures`, `difficult terrain`
- `moderate` effects: `smoke lightly obscures`, `difficult terrain`, `open flames spread`
- `heavy` effects: `smoke lightly obscures`, `difficult terrain`, `open flames spread`, `travel route blocked`
- `severe` effects: `smoke lightly obscures`, `difficult terrain`, `open flames spread`, `travel route blocked`, `settlements threatened`

#### `winter_gale`

- Name: `Winter Gale`
- Category: `storm`
- Environments: `surface`, `underwater`
- Summary: Hard cold wind or current slams exposed travelers and vessels.
- `light` effects: `strong wind`, `fog dispersed`
- `moderate` effects: `strong wind`, `ranged attacks at disadvantage`
- `heavy` effects: `strong wind`, `ranged attacks at disadvantage`, `small craft endangered`
- `severe` effects: `strong wind`, `ranged attacks at disadvantage`, `small craft endangered`, `travel halted in exposed terrain`

### Dynamic Weather Narrative Templates

These are the built-in sentence templates and vocabularies that `buildNarrative()` assembles at runtime.

#### Temperature Labels

- Imperial: `{tempF} degrees fahrenheit`
- Metric: `{tempC} degrees celsius`

#### Temperature Adjectives

- `frigid`
- `cold`
- `mild`
- `warm`
- `hot`

#### Sky-State Vocabulary

- `clear`
- `partly cloudy`
- `cloudy`
- `overcast`
- `stormy`

#### Compass Vocabulary Used In Surface Wind Lines

- `north`
- `north-northeast`
- `northeast`
- `east-northeast`
- `east`
- `east-southeast`
- `southeast`
- `south-southeast`
- `south`
- `south-southwest`
- `southwest`
- `west-southwest`
- `west`
- `west-northwest`
- `northwest`
- `north-northwest`

#### Precipitation Phrase Template

- Core template: `{band} {type}`
- Auto-resolved type when the source weather does not specify one: `drip` for subterranean locales, `snow` at 32 F and below, `sleet` at 36 F and below, otherwise `rain`.

#### Vertical Intro Templates

- `At an unknown depth`
- `At an elevation of {preferredDepthLabel}`
- `At a depth of {fathomsWithPreferredLabel}`
- `At approximately {subterraneanDepthLabel} below the surface`
- `At a depth of {preferredDepthLabel} below the surface`

#### Water / Airflow Strength Vocabulary

- `dead calm`
- `light`
- `steady`
- `moderate`
- `strong`
- `heavy`
- `severe`
- `violent`
- `a faint draft`
- `a steady draft`
- `a moderate draft`
- `a strong draft`
- `a heavy draft`

#### Surface / Underwater / Subterranean Sentence Skeletons

- `{intro}, the temperature is {temp}, the air feels {adj}, and the skies are {skies}`
- `At {temp}, the temperature is {adj}, and the skies are {skies}`
- `... with {precipitation}` appended when precipitation is present on a surface locale
- `{introOrFallback}, the water feels {adj}` for underwater locales
- `{introOrFallback}, the air feels {adj}` for subterranean locales
- ` and the current is dead calm.`
- ` and the current is {currentStrength}.`
- `. The airflow is dead calm.`
- `. The airflow is {airflowStrength}.`
- `. Wind is dead calm.`
- `. Wind is coming from the {direction} at about {knotsLabel}.`
- `{subterraneanPrecipitation}` becomes `, and {precipitation} clings to the passages` when subterranean precipitation is present

#### Sea Chop Sentences

- `The sea surface is smooth, with no chop.`
- `Sea chop is {chopBand}.`

#### Underwater Visibility Narration

- `Ambient light still reaches this depth, and visibility remains workable.`
- `Ambient light has fallen into a blue-green twilight, and visibility is short.`
- `Ambient light is effectively gone here, leaving the water dark unless a light source is carried.`
- `Ambient light still reaches this depth, but suspended matter keeps visibility short.`
- ` The current disturbance cuts it down further.` (suffix appended when a critical disturbance is active)

#### Underdark Visibility Narration

- `Ambient visibility is dark by default, and only carried light or darkvision pushes beyond it.`
- ` The active hazard further obscures the passages.` (suffix appended when a critical event is active)
- Detail string: `Ambient visibility is dark by default; only carried light, bioluminescence, or darkvision pushes beyond it.`

#### Critical Event Suffix

- ` A {severity} {eventNameLower} is in progress.`

#### Unique Critical-Event Effect Descriptor Vocabulary

- `Perception at disadvantage`
- `air becomes hazardous`
- `ash lightly obscures`
- `breathing is difficult`
- `capsize risk`
- `cave-ins or landslides possible`
- `coastal flooding`
- `creatures knocked prone`
- `creatures may be swept away`
- `creatures may fall prone`
- `deck footing hazardous`
- `difficult terrain`
- `difficult terrain from ash`
- `difficult terrain from wreckage`
- `dust lightly obscures`
- `exposed creatures risk exhaustion`
- `extreme heat exposure`
- `fissures open`
- `flash flooding possible`
- `flying debris`
- `fog dispersed`
- `forced movement toward center`
- `ground unstable`
- `heavy seas`
- `lava channels block routes`
- `lightly obscured`
- `loose stone becomes difficult terrain`
- `low crossings blocked`
- `minor cracks and slides`
- `minor fissures`
- `navigation at disadvantage`
- `open flames extinguished`
- `open flames spread`
- `open flames sputter`
- `passage blocked`
- `passage partly blocked`
- `ranged attacks at disadvantage`
- `roads washed out`
- `roofs risk collapse under ash`
- `rough seas`
- `rough water`
- `routes become impassable without protection`
- `routes must be rerouted`
- `secondary collapse risk`
- `settlements flooded`
- `settlements threatened`
- `slippery ground`
- `small craft endangered`
- `small craft swamped`
- `small depression forms`
- `smoke lightly obscures`
- `storm surge risk`
- `strong wind`
- `structures collapse`
- `structures collapse into sinkhole`
- `structures damaged`
- `structures destroyed`
- `structures take icing stress`
- `surfaces slick with ash`
- `travel halted in exposed terrain`
- `travel halted in open desert`
- `travel pace reduced`
- `travel route blocked`
- `travel route cut`
- `visibility reduced`
- `visibility reduced underwater`
- `water demand increased`
- `wildfire risk`
- `wreckage creates difficult terrain`

## Notes

- `fts_weather` can consume quips from `fts_quips`, but the current `fts_quips` corpus does not ship weather-specific lookup paths. Weather therefore relies on its own built-in fallback quips unless quips are supplied through mule data or a future corpus expansion.
- The calendar module requests `quips.festival.<key>.medium` inside `resolveFestivalLongQuip()`, despite the surrounding comments and fallback naming referring to ?long? quips. This inventory records the source text as shipped, not the intended naming.
