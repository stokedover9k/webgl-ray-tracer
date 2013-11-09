
FILES="gl.js matrix-stack.js models.js swinging.* vecs.js flower-1.js anim.html segments.js flower-2.js"

zip swing.zip ${FILES}

scp swing.zip yas225@access.cims.nyu.edu:/home/yas225/public_html/graphics/
