
FILES="gl.js matrix-stack.js models.js svecs.js segments.js grab2.js 2link.js 2link.html"

zip swing.zip ${FILES}

scp swing.zip yas225@access.cims.nyu.edu:/home/yas225/public_html/graphics/
