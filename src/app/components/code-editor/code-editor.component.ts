import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit {

  public codeMirrorOptions: any = {
    theme: 'idea',
    mode: 'python',
    lineNumbers: true,
    // lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
    // autoCloseBrackets: true,
    // matchBrackets: true,
    lint: true
  };


  public obj!: string;

  ngOnInit(){
    this.obj = '# Literals';
  }

  setEditorContent(event: any) {
    // console.log(event, typeof event);
    console.log(this.obj);
  }

}
