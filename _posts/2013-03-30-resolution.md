---
title: Display Resolution Calculator
description: A tool to calculate pixel density, physical dimensions, and angular resolution
tags: math
---

The first part of this tool calculates pixel density (DPI/PPI or ppcm) and physical dimensions, given the pixel dimensions and diagonal size of the display. The second part uses viewing distance to calculate the Points Per Degree and how well the pixels resolve for an eye with 20/20 visual acuity.

For information on the terminology and the math, scroll down to the "How this works" section.

{% include src/resolution.html %}

<script id="loadMath" src='//cdn.mathjax.org/mathjax/latest/MathJax.js?config=MML_HTMLorMML,//lane-widen.com/assets/mathjax-config.js'></script>

# How this works

## Part 1: Pixel density

Manufacturers usually only provide the resolution (pixel dimensions) of the display and the diagonal measurement. To calculate pixel density, we need the horizontal or vertical dimensions. We can represent a display with physical side dimensions <var>a</var> and <var>b</var> and diagonal <var>c</var> (see diagram).

![Display dimensions diagram](/img/resolution/dimensions.jpg){:style="width:200px"}

Let's say the pixel dimensions are 1024 by 768, so the aspect ratio is 4:3. This is the ratio between <var>a</var> and <var>b</var>, so we can represent <var>b</var> as a fraction of <var>a</var>:

\$$ b = \frac{3}{4}a $$

We can now use the Pythagorean Theorem to solve for <var>a</var> or <var>b</var>:

\$$ a^2 + b^2 = c^2 $$

Let's say the diagonal <var>c</var> is 10 inches. In this case, 

\$$ a^2 + \left(\frac{3}{4}a\right)^2 = 10^2 $$

\$$ a = 8 $$

Finally, pixel density is equal to one of the pixel dimensions divided by its corresponding physical dimension. In this example, the pixel density would be

\$$ \frac{1024}{a} = \frac{1024}{8} = 128 $$

## Part 2: Angular resolution

The quality perceived by the eye does not depend solely on pixel density. Viewing distance also needs to be taken into account. The closer you are to the display, the more your eyes will resolve it (distinguish its individual pixels). Thus, a 50-inch, 1080p HDTV can look just as sharp as a much smaller computer monitor of the same resolution, due to the difference in viewing distance.

![Display trigonometry diagram](/img/resolution/trig.jpg){:style="width:200px"}

This diagram shows the relation between the pixel size and viewing distance affect perceived quality, represented by the subtended angle <var>S</var>. Note that pixel size is the reciprocal of pixel density.

Decreasing angle <var>S</var> improves perceived quality, and this can be done by increasing pixel density or viewing distance. The relation can be expressed using trigonometry as

$$ S = 2\tan^{-1}\left(\frac{s}{2d}\right) $$

Visual acuity is the measure of the ability of an eye to distinguish detail. The generally-accepted value for normal vision is commonly referred to as "20/20 vision." This is [defined](http://en.wikipedia.org/wiki/Visual_acuity#Definition) as the ability to see something that subtends to an angle of 5 arcminutes (1 arcminute is 1/60 of a degree). 

Knowing this, one can calculate useful information involving <var>S</var>, <var>d</var> and <var>s</var>:

- Given pixel density, what is the maximum distance at which the pixels will be just resolved? (Given <var>s</var>, what <var>d</var> makes <var>S</var> equal to 1 arcminute?)
- Given viewing distance, what is the maximum pixel density the eye can resolve? (Given <var>d</var>, what <var>s</var> makes <var>S</var> equal to 1 arcminute?)
- Pixels per degree: How many pixels subtend to an angle <var>S</var> of 1 degree (given <var>s</var> and <var>d</var>)
- At a typical viewing distance, the actual pixel density is what fraction of the maximum resolve pixel density? This is a good measure of perceived quality. At 100%, the pixels are resolved. At a higher percentage, the eye would theoretically not see the difference. At a lower percentage, one should distinguish the individual pixels. Thus, a good display, when viewed from typical distance, should have a perceived quality of 100% or more.
