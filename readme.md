# hotnail.js

A JavaScript module that offers suggestions for email addresses when the user misspells something – see [examples](#examples) below!

## Examples

When a users types an email address, hotnail.js (therefore the name) suggests something better:

john.doe<span>@</span>hotnail.com -> john.doe@<strong>hotmail.com</strong>

peter-parker@myowncom -> peter-parker@myown<strong>.com</strong>

h.potter<span>@</span>jkrowling.neet -> h.potter@jkrowling.<strong>net</strong>

dr..crane@@gmil.coom -> dr<strong>.</strong>crane<strong>@</strong><strong>gmail.com</strong>

unfo<span>@</span>goglemail.co -> <strong>info</strong>@<strong>googlemail.com</strong>

helo<span>@</span>whoever.comm -> <strong>hello</strong>@whoever.<strong>com</strong>

### And when your user already has entered a name, things get really awesome:

*Name: Luke Skywalker*

lke..skywlke<span>@</span>gamil.co -> <strong>luke</strong><strong>.</strong><strong>skywalker<strong>@</strong>gmail.com</strong>

kskywalker<span>@</span>hotmail.com -> <strong>l</strong>skywalker<span>@</span>hotmail.com

j.skywalk<span>@</span>gnx.nett -> <strong>l</strong>.<strong>skywalker<strong>@</strong>gmx.net</strong>

skywalke-luk<span>@</span>gail.co -> <strong>skywalker</strong>-<strong>luke</strong>@<strong>gmail.com</strong>

### Even if your user’s names contain umlauts, accents or others (äöüáàâåß etc.), hotnail.js is at your side:

*Name: Jürgen König*

jürgn.könig@könig.we -> <strong>jürgen</strong>.k<strong>oe</strong>nig@k<strong>oe</strong>nig.<strong>de</strong>

*The bold text is what hotnail.js would have marked as changed*