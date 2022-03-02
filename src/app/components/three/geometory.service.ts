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

    const mesh = this.parse(response);
    this.scene.add( mesh );
    this.scene.render();
  }


  private parse( data: string ): THREE.Object3D {

    const nodes: any = {};
    const elements: any = {};

    const lines = data.split( '\n' );

    for ( let r=0; r<lines.length; r++ ) {

      let line = lines[ r ].trim();

      if ( line.indexOf( '$MeshFormat' ) === 0 ) {
        r++;
        line = lines[r].trim();
        const version = line.split( ' ' )[ 0 ].trim();
        if ( version !== '4.1' ) throw new Error( 'Unsupported msh format: ' + version );

      } else if ( line.indexOf( '$Nodes' ) === 0 ) {
        r++;
        line = lines[r].trim(); // block, nodes, tag min, tag max
        const Info = line.split( ' ' );
        const block_count = parseInt(Info[0]);
        for(let b=0; b<block_count; b++){
          r++;
          // Block Info
          line = lines[r].trim();
          const bInfo = line.split( ' ' );
          const num = parseInt(bInfo[3]);
          // Node tag
          const node_list: string[] = new Array();
          for( let j=0; j<num; j++){
            r++
            node_list.push(lines[r].trim());
          }
          // x, y, z
          for( const key of node_list){
            r++
            line = lines[r].trim();
            const n = line.split( ' ' );
            const x = parseFloat(n[0]);
            const y = parseFloat(n[1]);
            const z = parseFloat(n[2]);
            nodes[key] = [ x, y, z ];
          }
        }

      } else if ( line.indexOf( '$EndNodes' ) === 0 ) {
        // Nodes ブロックの終わり
      } else if ( line.indexOf( '$Elements' ) === 0 ) {
        r++;
        line = lines[r].trim(); // block, elements, tag min, tag max
        const Info = line.split( ' ' );
        const block_count = parseInt(Info[0]);
        for(let b=0; b<block_count; b++){
          r++;
          line = lines[r].trim(); // dim, tag (surface), type, elements in block
          const eInfo = line.split( ' ' );
          const num = parseInt(eInfo[3]);
          const points = parseInt(eInfo[2]);
          // Node tag
          for( let j=0; j<num; j++){
            r++
            line = lines[r].trim();
            const e = line.split( ' ' );
            const key: string = e[0];
            const element_list = [];
            for(let k=1; k<=points; k++){
              element_list.push(e[k].trim());
            }
            elements[key] = element_list;
          }
        }
      } else if ( line.indexOf( '$EndElements' ) === 0 ) {
        // Elements ブロックの終わり
      }

    }





    const material = new THREE.MeshLambertMaterial( { transparent: true, color: 0xff0000, opacity: 0.2 } );

    let groupe = new THREE.Group();

    let geometry = new BufferGeometry();
    const positions: number[] = new Array();
    for(const key of Object.keys(elements)){
      for(const no of elements[key]){
        for(const n of nodes[no]){
          positions.push(n);
        }
      }
    }
    geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
    geometry.center();
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh( geometry, material );


    const geometry = new THREE.BufferGeometry().setFromPoints( positions );
    const matLine = new THREE.LineBasicMaterial({
      color: 0xFF0000,
      linewidth: 0.001,
    });
    const line = new THREE.Line(geometry, matLine);

    

    groupe.add(mesh);


    return groupe;
  }

}
