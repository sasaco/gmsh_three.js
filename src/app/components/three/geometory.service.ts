import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { SceneService } from './scene.service';

@Injectable({
  providedIn: 'root'
})
export class GeometoryService {
  constructor(private scene: SceneService) { }

  loadMsh(response: string) {

    const geometry = this.parse(response);

    geometry.center();
    geometry.computeVertexNormals();

    const material = new THREE.MeshLambertMaterial( { color: 0xffffff } );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( - 0.075, 0.005, 0 );
    mesh.scale.multiplyScalar( 0.2 );
    this.scene.add( mesh );

  }


  private parse( data: string ): BufferGeometry {

    // connectivity of the triangles
    // const indices = [];

    // triangles vertices
    const positions = [];

    // // red, green, blue colors in the range 0 to 1
    // const colors = [];

    // // normal vector, one per vertex
    // const normals = [];

    // let result;

    // // pattern for detecting the end of a number sequence
    // const patWord = /^[^\d.\s-]+/;

    // // pattern for reading vertices, 3 floats or integers
    // const pat3Floats = /(\-?\d+\.?[\d\-\+e]*)\s+(\-?\d+\.?[\d\-\+e]*)\s+(\-?\d+\.?[\d\-\+e]*)/g;

    // // pattern for connectivity, an integer followed by any number of ints
    // // the first integer is the number of polygon nodes
    // const patConnectivity = /^(\d+)\s+([\s\d]*)/;

    // // indicates start of vertex data section
    // const patPOINTS = /^POINTS /;

    // // indicates start of polygon connectivity section
    // const patPOLYGONS = /^POLYGONS /;

    // // indicates start of triangle strips section
    // const patTRIANGLE_STRIPS = /^TRIANGLE_STRIPS /;

    // // POINT_DATA number_of_values
    // const patPOINT_DATA = /^POINT_DATA[ ]+(\d+)/;

    // // CELL_DATA number_of_polys
    // const patCELL_DATA = /^CELL_DATA[ ]+(\d+)/;

    // // Start of color section
    // const patCOLOR_SCALARS = /^COLOR_SCALARS[ ]+(\w+)[ ]+3/;

    // // NORMALS Normals float
    // const patNORMALS = /^NORMALS[ ]+(\w+)[ ]+(\w+)/;

    let inPointsSection = false;
    let inPolygonsSection = false;
    let inTriangleStripSection = false;
    let inPointDataSection = false;
    let inCellDataSection = false;
    let inColorSection = false;
    let inNormalsSection = false;

    const lines = data.split( '\n' );

    for ( const i in lines ) {

      const line = lines[ i ].trim();

      if ( line.indexOf( 'DATASET' ) === 0 ) {

        const dataset = line.split( ' ' )[ 1 ];

        if ( dataset !== 'POLYDATA' ) throw new Error( 'Unsupported DATASET type: ' + dataset );

      } else if ( inPointsSection ) {

        // get the vertices
        while ( ( result = pat3Floats.exec( line ) ) !== null ) {

          if ( patWord.exec( line ) !== null ) break;

          const x = parseFloat( result[ 1 ] );
          const y = parseFloat( result[ 2 ] );
          const z = parseFloat( result[ 3 ] );
          positions.push( x, y, z );

        }

      } else if ( inPolygonsSection ) {

        if ( ( result = patConnectivity.exec( line ) ) !== null ) {

          // numVertices i0 i1 i2 ...
          const numVertices = parseInt( result[ 1 ] );
          const inds = result[ 2 ].split( /\s+/ );

          if ( numVertices >= 3 ) {

            const i0 = parseInt( inds[ 0 ] );
            let k = 1;
            // split the polygon in numVertices - 2 triangles
            for ( let j = 0; j < numVertices - 2; ++ j ) {

              const i1 = parseInt( inds[ k ] );
              const i2 = parseInt( inds[ k + 1 ] );
              indices.push( i0, i1, i2 );
              k ++;

            }

          }

        }

      } else if ( inTriangleStripSection ) {

        if ( ( result = patConnectivity.exec( line ) ) !== null ) {

          // numVertices i0 i1 i2 ...
          const numVertices = parseInt( result[ 1 ] );
          const inds = result[ 2 ].split( /\s+/ );

          if ( numVertices >= 3 ) {

            // split the polygon in numVertices - 2 triangles
            for ( let j = 0; j < numVertices - 2; j ++ ) {

              if ( j % 2 === 1 ) {

                const i0 = parseInt( inds[ j ] );
                const i1 = parseInt( inds[ j + 2 ] );
                const i2 = parseInt( inds[ j + 1 ] );
                indices.push( i0, i1, i2 );

              } else {

                const i0 = parseInt( inds[ j ] );
                const i1 = parseInt( inds[ j + 1 ] );
                const i2 = parseInt( inds[ j + 2 ] );
                indices.push( i0, i1, i2 );

              }

            }

          }

        }

      } else if ( inPointDataSection || inCellDataSection ) {

        if ( inColorSection ) {

          // Get the colors

          while ( ( result = pat3Floats.exec( line ) ) !== null ) {

            if ( patWord.exec( line ) !== null ) break;

            const r = parseFloat( result[ 1 ] );
            const g = parseFloat( result[ 2 ] );
            const b = parseFloat( result[ 3 ] );
            colors.push( r, g, b );

          }

        } else if ( inNormalsSection ) {

          // Get the normal vectors

          while ( ( result = pat3Floats.exec( line ) ) !== null ) {

            if ( patWord.exec( line ) !== null ) break;

            const nx = parseFloat( result[ 1 ] );
            const ny = parseFloat( result[ 2 ] );
            const nz = parseFloat( result[ 3 ] );
            normals.push( nx, ny, nz );

          }

        }

      }

      if ( patPOLYGONS.exec( line ) !== null ) {

        inPolygonsSection = true;
        inPointsSection = false;
        inTriangleStripSection = false;

      } else if ( patPOINTS.exec( line ) !== null ) {

        inPolygonsSection = false;
        inPointsSection = true;
        inTriangleStripSection = false;

      } else if ( patTRIANGLE_STRIPS.exec( line ) !== null ) {

        inPolygonsSection = false;
        inPointsSection = false;
        inTriangleStripSection = true;

      } else if ( patPOINT_DATA.exec( line ) !== null ) {

        inPointDataSection = true;
        inPointsSection = false;
        inPolygonsSection = false;
        inTriangleStripSection = false;

      } else if ( patCELL_DATA.exec( line ) !== null ) {

        inCellDataSection = true;
        inPointsSection = false;
        inPolygonsSection = false;
        inTriangleStripSection = false;

      } else if ( patCOLOR_SCALARS.exec( line ) !== null ) {

        inColorSection = true;
        inNormalsSection = false;
        inPointsSection = false;
        inPolygonsSection = false;
        inTriangleStripSection = false;

      } else if ( patNORMALS.exec( line ) !== null ) {

        inNormalsSection = true;
        inColorSection = false;
        inPointsSection = false;
        inPolygonsSection = false;
        inTriangleStripSection = false;

      }

    }

    let geometry = new BufferGeometry();
    geometry.setIndex( indices );
    geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );

    if ( normals.length === positions.length ) {

      geometry.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );

    }

    if ( colors.length !== indices.length ) {

      // stagger

      if ( colors.length === positions.length ) {

        geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

      }

    } else {

      // cell

      geometry = geometry.toNonIndexed();
      const numTriangles = geometry.attributes['position'].count / 3;

      if ( colors.length === ( numTriangles * 3 ) ) {

        const newColors = [];

        for ( let i = 0; i < numTriangles; i ++ ) {

          const r = colors[ 3 * i + 0 ];
          const g = colors[ 3 * i + 1 ];
          const b = colors[ 3 * i + 2 ];

          newColors.push( r, g, b );
          newColors.push( r, g, b );
          newColors.push( r, g, b );

        }

        geometry.setAttribute( 'color', new Float32BufferAttribute( newColors, 3 ) );

      }

    }

    return geometry;

  }

}
