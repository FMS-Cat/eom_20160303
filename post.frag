#define PI 3.14159265
#define V vec2(0.,1.)
#define saturate(i) clamp(i,0.,1.)

precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform bool vert;
uniform sampler2D dryTexture;
uniform sampler2D blurTexture;

vec3 blur( vec2 _uv, vec2 _dir ) {
  vec3 ret = V.xxx;
  for ( int i = -5; i <= 5; i ++ ) {
    ret += texture2D( blurTexture, _uv + _dir * float( i ) ).xyz;
  }
  return ret;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec3 ret = V.xxx;

  vec2 blurDir = V.yx;
  if ( vert ) {
    blurDir = V.xy;
  }
  blurDir *= 0.008;
  float blurInt = 0.1;
  vec2 colorGap = V.yx * 0.01;

  ret += V.yxx * blur( uv + colorGap, blurDir ) * blurInt;
  ret += V.xyx * blur( uv, blurDir ) * blurInt;
  ret += V.xxy * blur( uv - colorGap, blurDir ) * blurInt;

  if ( vert ) {
    ret *= 0.5 + 0.5 * saturate( sin( ( uv.x + uv.y ) * 200.0 + time * PI * 16.0 ) * 100.0 + 0.5 );
    ret += texture2D( dryTexture, uv ).xyz * 0.8;
  }

  gl_FragColor = vec4( ret, 1.0 );
}
