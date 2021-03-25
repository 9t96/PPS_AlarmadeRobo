import { Component, OnInit } from '@angular/core';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';
import { Flashlight } from '@ionic-native/flashlight/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { AudioManagerService } from 'src/app/services/AudioManager/audio-manager.service';

interface Ejes{
  x: number,
  y: number,
  z: number
}

enum posiciones{
  INCLINADODERECHA,
  INCLINADOIZQUIERDA,
  VERTICAL,
  HORIZONTAL
}
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  public aceleracion: Ejes;
  showCardData: Boolean;
  subscription: any;
  data:any;
  posicion: posiciones;

  constructor(private dvcMotion:DeviceMotion,private vibration: Vibration,private flashlight: Flashlight, public audioManager: AudioManagerService) {
    this.showCardData = false;
  }

  ngOnInit(){
    this.audioManager.cargarAudios();
  }

  StartWatching(){
    console.log("Start watching MOTION")
    this.showCardData = true;
    this.subscription = this.dvcMotion.watchAcceleration({ frequency: 500 }).subscribe((acc: DeviceMotionAccelerationData) => {
      if(acc.x < -8.0 && this.posicion != posiciones.INCLINADODERECHA)
        {
          this.posicion = posiciones.INCLINADODERECHA;
          this.audioManager.reproducirAudio("derecha",3);
          console.log("derecha")
          //un sonido
        }
        //inclinado hacia la izquierda
        else if(acc.x > 8.0 && this.posicion != posiciones.INCLINADOIZQUIERDA){
          this.posicion = posiciones.INCLINADOIZQUIERDA;
          console.log("izquierda");
          this.audioManager.reproducirAudio("izquierda",2);
          //otro sonido

        }
        //vertical (portraid)
        else if(acc.x > -3.0 && acc.x < 3.0 && acc.y > 8.5 && this.posicion != posiciones.VERTICAL){
          this.posicion = posiciones.VERTICAL;
          console.log("vertical")
          this.flashlight.switchOn();
          this.audioManager.reproducirAudio("vertical",5);
          setTimeout(() => {
            this.flashlight.switchOff();
          }, 5000);
          //luz 5 sec + sonido
        }
        //horizontal(landscape)
        else if(acc.x > -3.0 && acc.x < 3.0 && acc.y < 1.0 && acc.y > -1&& this.posicion != posiciones.HORIZONTAL){
          this.posicion = posiciones.HORIZONTAL;
          this.vibration.vibrate(5000);
          this.audioManager.reproducirAudio("horizontal",5);
          console.log("horizontal")
          //vibrar + sonido
        }
      this.data = acc;
      console.log(acc)
    });
  }

  StopWatching(){
    this.subscription.unsuscribe();
  }

}
