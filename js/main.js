( function() {

  'use strict';

  let requestText = function( _url, _callback ){
    let xhr = new XMLHttpRequest();
    xhr.open( 'GET', _url, true );
    xhr.responseType = 'text';
    xhr.onload = function( _e ){
      if( typeof _callback === 'function' ){
        _callback( this.response );
      }
    };
    xhr.send();
  };

  // ------

  let seed;
  let xorshift = function( _seed ) {
    seed = _seed || seed || 1;
    seed = seed ^ ( seed << 13 );
    seed = seed ^ ( seed >>> 17 );
    seed = seed ^ ( seed << 5 );
    return seed / Math.pow( 2, 32 ) + 0.5;
  };

  // ------

  let preCanvas = document.createElement( 'canvas' );
  preCanvas.width = canvas.width;
  preCanvas.height = canvas.height;
  let context = preCanvas.getContext( '2d' );

  // ------

  let gl = canvas.getContext( 'webgl' );
  let glCat = new GLCat( gl );

  let postProgram;
  let quadVBO = glCat.createVertexbuffer( [ -1, -1, 1, -1, -1, 1, 1, 1 ] );
  let texture = glCat.createTexture();
  let framebuffer = glCat.createFramebuffer( canvas.width, canvas.height );

  // ------

  let frame = 0;
  let nChar = 16;

  let update = function() {

    let time = frame / 64.0;

    context.fillStyle = '#000';
    context.fillRect( 0, 0, canvas.width, canvas.height );

    context.fillStyle = '#fff';
    let fontS = '500 10px Wt-Position-Mono, monospace';
    let fontL = '500 44px Helvetica Neue, sans-serif';
    let posS = 0.03;
    let posL = 0.16;

    {
      context.font = fontS;
      context.fillText( 'random() * 256', 0, canvas.height * ( posS ) );

      context.font = fontL;
      xorshift( frame );
      let str = '';
      for ( let iChar = 0; iChar < nChar; iChar ++ ) {
        str += String.fromCharCode( xorshift() * 256.0 );
      }
      context.fillText( str, 0, canvas.height * ( posL ) );
    }

    context.fillRect( 0.0, canvas.height * 0.2, canvas.width, 1.0 );

    {
      context.font = fontS;
      context.fillText( 'random() * 65536', 0, canvas.height * ( 0.2 + posS ) );

      context.font = fontL;
      xorshift( frame );
      let str = '';
      for ( let iChar = 0; iChar < nChar; iChar ++ ) {
        str += String.fromCharCode( xorshift() * 65536.0 );
      }
      context.fillText( str, 0, canvas.height * ( 0.2 + posL ) );
    }

    context.fillRect( 0.0, canvas.height * 0.4, canvas.width, 1.0 );

    {
      context.font = fontS;
      context.fillText( 'pow( random(), 4.0 ) * 65536', 0, canvas.height * ( 0.4 + posS ) );

      context.font = fontL;
      xorshift( frame );
      let str = '';
      for ( let iChar = 0; iChar < nChar; iChar ++ ) {
        str += String.fromCharCode( Math.pow( xorshift(), 4.0 ) * 65536.0 );
      }
      context.fillText( str, 0, canvas.height * ( 0.4 + posL ) );
    }

    context.fillRect( 0.0, canvas.height * 0.6, canvas.width, 1.0 );

    {
      context.font = fontS;
      context.fillText( 'pow( random(), 9.0 ) * 65536', 0, canvas.height * ( 0.6 + posS ) );

      context.font = fontL;
      xorshift( frame );
      let str = '';
      for ( let iChar = 0; iChar < nChar; iChar ++ ) {
        str += String.fromCharCode( Math.pow( xorshift(), 9.0 ) * 65536.0 );
      }
      context.fillText( str, 0, canvas.height * ( 0.6 + posL ) );
    }

    context.fillRect( 0.0, canvas.height * 0.8, canvas.width, 1.0 );

    {
      context.font = fontS;
      context.fillText( 'floor( pow( random(), 9.0 ) * 256 ) * 256 + random() * 256', 0, canvas.height * ( 0.8 + posS ) );

      context.font = fontL;
      xorshift( frame );
      let str = '';
      for ( let iChar = 0; iChar < nChar; iChar ++ ) {
        str += String.fromCharCode( Math.floor( Math.pow( xorshift(), 9.0 ) * 256.0 ) * 256.0 + xorshift() * 256.0 );
      }
      context.fillText( str, 0, canvas.height * ( 0.8 + posL ) );
    }

    // ------
    // post

    glCat.setTexture( texture, preCanvas );

    glCat.useProgram( postProgram );
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );
    glCat.clear();

    glCat.attribute( 'p', quadVBO, 2 );

    glCat.uniform1f( 'time', time );
    glCat.uniform2fv( 'resolution', [ canvas.width, canvas.height ] );
    glCat.uniform1i( 'vert', false );
    glCat.uniformTexture( 'dryTexture', texture, 0 );
    glCat.uniformTexture( 'blurTexture', texture, 1 );

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    gl.bindFramebuffer( gl.FRAMEBUFFER, null );
    glCat.clear();

    glCat.uniform1i( 'vert', true );
    glCat.uniformTexture( 'blurTexture', framebuffer.texture, 1 );

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    gl.flush();

    // ------
    // ending

    if ( renderCheckbox.checked ) {
      let a = document.createElement( 'a' );
      let url = canvas.toDataURL();
      a.href = url;
      a.download = ( '0000' + frame ).slice( -5 ) + '.png';
      a.click();
    }

    frame ++;
    requestAnimationFrame( update );

  };

  button.onclick = function() {
    update();
  };

  // ------

  requestText( 'shader/post.frag', function( _frag ) {
    let vert = 'attribute vec2 p; void main() { gl_Position = vec4( p, 0.0, 1.0 ); }';
    postProgram = glCat.createProgram( vert, _frag );
  } );

} )();
