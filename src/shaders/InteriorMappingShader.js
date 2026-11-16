/**
 * Taipei 101 - Interior Window Mapping Custom Shader
 */

import * as THREE from 'three';

export class InteriorMappingShader {
  static apply(material) {
    material.customProgramCacheKey = () => 'Taipei101_InteriorMapping';

    material.userData.nightFactor = { value: 0.8 };
    material.userData.time = { value: 0.0 };

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uNightFactor = material.userData.nightFactor;
      shader.uniforms.uTime = material.userData.time;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>
        varying vec3 vCustomWorldPos;
        varying vec3 vCustomWorldNormal;
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `
        #include <worldpos_vertex>
        vCustomWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vCustomWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `
        #include <common>
        varying vec3 vCustomWorldPos;
        varying vec3 vCustomWorldNormal;
        uniform float uNightFactor;
        uniform float uTime;

        float hash21(vec2 p) {
          p = fract(p * vec2(234.34, 435.345));
          p += dot(p, p + 34.23);
          return fract(p.x * p.y);
        }

        vec3 getOfficeColor(float roomSeed) {
          if (roomSeed > 0.82) {
            return vec3(1.0, 0.95, 0.82) * 2.2;
          } else if (roomSeed > 0.52) {
            return vec3(0.85, 0.95, 1.0) * 2.0;
          } else if (roomSeed > 0.28) {
            return vec3(1.0, 0.88, 0.70) * 1.8;
          } else {
            return vec3(0.08, 0.12, 0.18);
          }
        }
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `
        #include <emissivemap_fragment>

        vec2 windowSize = vec2(3.6, 3.8);
        vec2 roomCoord = vCustomWorldPos.xz + vCustomWorldPos.xy;
        vec2 roomIndex = floor(roomCoord / windowSize);
        vec2 roomUV = fract(roomCoord / windowSize);

        vec2 border = step(vec2(0.08), roomUV) * step(roomUV, vec2(0.92));
        float frameMask = border.x * border.y;

        float roomSeed = hash21(roomIndex);
        vec3 roomLight = getOfficeColor(roomSeed);

        float depthShade = smoothstep(0.0, 0.5, min(roomUV.x, min(roomUV.y, min(1.0 - roomUV.x, 1.0 - roomUV.y))));

        vec3 finalInteriorEmission = roomLight * frameMask * (depthShade * 0.7 + 0.3) * uNightFactor;
        totalEmissiveRadiance += finalInteriorEmission * 1.6;
        `
      );
    };
  }
}
