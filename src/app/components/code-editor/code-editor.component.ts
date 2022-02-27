import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GeometoryService } from '../three/geometory.service';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit {

  constructor(
    private geo: GeometoryService,
    private http: HttpClient) { }


  public codeMirrorOptions: any = {
    theme: 'idea',
    mode: 'javascript',
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
    autoCloseBrackets: true,
    matchBrackets: true,
    lint: true
  };


  public obj!: string;
  public out: string = "";

  ngOnInit(){
    this.obj = 'lc = 0.3;\n'
    this.obj += 'Point(1) = {0.0,0.0,0.0,lc};\n'
    this.obj += 'Point(2) = {1,0.0,0.0,lc};\n'
    this.obj += 'Point(3) = {1,1,0.0,lc};\n'
    this.obj += 'Point(4) = {0,1,0.0,lc};\n'
    this.obj += 'Line(1) = {4,3};\n'
    this.obj += 'Line(2) = {3,2};\n'
    this.obj += 'Line(3) = {2,1};\n'
    this.obj += 'Line(4) = {1,4};\n'
    this.obj += 'Line Loop(5) = {2,3,4,1};\n'
    this.obj += 'Plane Surface(6) = {5};\n'
    this.obj += 'tmp[] = Extrude {0,0.0,1} {\n'
    this.obj += '  Surface{6};\n'
    this.obj += '};\n'
    this.obj += 'Physical Volume(1) = tmp[1];\n'
  }

  setEditorContent(event: any) {
    // console.log(event, typeof event);
    console.log(this.obj);
  }


  onClick() {

    const url = 'https://uij0y12e2l.execute-api.ap-northeast-1.amazonaws.com/default/gmsh';

    let d: number = 3;
    let geo: string = this.obj;
    if(geo === undefined){
      alert('入力ファイル(.geo) に入力してください');
      return;
    }

    const json = JSON.stringify({
      dim: d,
      geo: geo.trim()
  });
    this.http.post(url, json, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      responseType: 'text'
    }).subscribe(
      response => {
        // 通信成功時の処理（成功コールバック）
        console.log('通信成功!!');
        const jsonData = JSON.parse(response);
        this.geo.loadMsh(jsonData['msh']);
      },
      error => {
        let messege: string = '通信 ' + error.statusText;
        if ('_body' in error) {
          messege += '\n' + error._body;
        }
        alert(messege);
        console.error(error);
      }
    );
  }


}
