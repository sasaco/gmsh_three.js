import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';
import { SceneService } from './scene.service';
import { ThreeComponent } from './three.component';

@Injectable({
  providedIn: 'root'
})
export class GeometoryService {
  
  groupe = new THREE.Object3D();

  constructor(private scene: SceneService) {
    this.scene.add( this.groupe );
  }

  loadMsh(response: string) {
    this.scene.remove(this.groupe);
    this.groupe = new THREE.Object3D();
    this.groupe = this.parse(response);
    this.scene.add( this.groupe);
    this.scene.render();
  }


  private parse( data: string ): THREE.Object3D {

    const nodes: any = {};
    const elements: any[] = new Array();

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
            nodes[key] = new Vector3( x, y, z );
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
          const type = parseInt(eInfo[2]);
          // Node tag
          const element: any = {};
          for( let j=0; j<num; j++){
            r++
            line = lines[r].trim();
            const e = line.split( ' ' );
            const key: string = e[0];
            let points = 0;
            if(type===4){
              points = 4; // Tetrahedron
            }
            const element_list = [];
            for(let k=1; k<=points; k++){
              element_list.push(e[k].trim());
            }
            element[key] = element_list;
          }
          elements.push({element, type});
        }
      } else if ( line.indexOf( '$EndElements' ) === 0 ) {
        // Elements ブロックの終わり
      }

    }

    let groupe = new THREE.Group();
    
    const material = new THREE.MeshLambertMaterial({ 
      transparent: true, 
      color: 0xFF0000, 
      // opacity: 0.2,
      // side: THREE.DoubleSide, 
      wireframe: true 
    });

    for(const e of elements){
      const element = e.element;
      const type = e.type;

      if(type===4){

        const positions: Vector3[] = new Array();
        let i = 0;
        for(const key of Object.keys(element)){
          const el = element[key];
          // 頂点インデックスを生成
          let index = new Uint32Array([
            i+0, i+1, i+2,
            i+1, i+2, i+3,
            i+3, i+1, i+0,
            i+0, i+3, i+2,
          ]);
          for(const no of el){
            positions.push(nodes[no]);
          }
          const geometry = new THREE.BufferGeometry().setFromPoints( positions );
          geometry.setIndex(new THREE.BufferAttribute(index, 1));
          const mesh = new THREE.Mesh( geometry, material );
          groupe.add(mesh);
          i += 4;
        }
      }
    }
    return groupe;
  }

}
