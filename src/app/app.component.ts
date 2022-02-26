import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  code: string = "console.log(100)";

  // フローティングウィンドウの位置
  public dragPosition = { x: 0, y: 0 };

  public changePosition() {
    this.dragPosition = {
      x: this.dragPosition.x,
      y: this.dragPosition.y,
    };
  }

}
