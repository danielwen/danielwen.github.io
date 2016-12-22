---
title: Creation Process For Awesomeness
description: Making a website with CSS 3D
tags: design programming musings
---

<div class="video-wrapper">
<iframe src="https://www.youtube.com/embed/8RFlAS-z8_c" allowfullscreen></iframe>
</div>

First and foremost, this website would not have such grasping visual effects without the inspiration of [Acko.net](http://acko.net), an exemplary demonstration of the potential of modern web. It allowed me to reconsider ideas that I had previously dismissed as fantasy. Examining it led me to discover new web standards, and I would consult it throughout my project.

My idea for the design first began with my obsession with circuitry and its intricate patterns. I needed a way to incorporate those seemingly erratic, yet subtly congruous lines into a 3-dimensional interface. I wanted something like Gibsonian cyberspace, but brighter and more welcoming. And so I used rectangular prisms, like blocks of data floating around on the vast expanses of the Internet. 

<div class="flexpair">
<p>
The design can come to life thanks to CSS3 3D transforms. Each prism is made up of 6 rectangles, and there are 67 prisms, giving a total of 402 objects, each requiring translation and rotation along 3 axes. It would take an eternity to write all those HTML elements and their attributes by hand, so I wrote a script to generate them given a list of coordinates and sizes.
</p>
<figure>
<pre><code>[[950,50],[300,100]]
[[990,170],[210,40]]
[[1040,270],[100,30]]
[[620,60],[170,120]]
[[720,260],[460,80]]
[[680,360],[150,60]]
</code></pre>
<figcaption>Position and size coordinates of the first 6 prisms</figcaption>
</figure>
</div>

<div class="flexpair">
<p>
The result is truly promising. I could texture the prisms, animate them independently, or even play a video on every one of them. But I decided to keep it simple and gave them a transparent gradient for a glassy appearance, and put them in front of a light background to evoke the sky and give a sense of space.
</p>
<figure>
<img src="/img/creation-process/cover.jpg" alt="Plain prisms"/>
<figcaption>Plain prisms</figcaption>
</figure>
</div>

To achieve smooth navigation, I used HTML5 browser history state methods. My solution is far from perfect, but should suffice to keep at least some kind of unity between the interface and the browser history. Finally, coding with jQuery greatly facilitated an otherwise tedious process. 

I then needed to implement a version compatible with browsers that do not support 3D transforms, as well as with mobile browsers. For the former, I made an image map, but the latter turned out to be a problem. As of this writing, almost all browsers do not correctly interpret percentage values as image map coordinates, so they cannot "scale." Therefore, I wrote some more script to alter the pixel values according to screen or window dimensions.
