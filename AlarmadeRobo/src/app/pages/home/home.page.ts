import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  DeviceMotion,
  DeviceMotionAccelerationData,
} from "@ionic-native/device-motion/ngx";
import { Flashlight } from "@ionic-native/flashlight/ngx";
import { Vibration } from "@ionic-native/vibration/ngx";
import { AlertController, Platform } from "@ionic/angular";
import { Observable, Subscription } from "rxjs";
import { AudioManagerService } from "src/app/services/AudioManager/audio-manager.service";
import { AuthService } from "src/app/services/auth.service";

interface Ejes {
  x: number;
  y: number;
  z: number;
}

enum posiciones {
  INCLINADODERECHA,
  INCLINADOIZQUIERDA,
  VERTICAL,
  HORIZONTAL,
}

class User {
  email: string;
  password: string;
}
@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage implements OnInit {
  public aceleracion: Ejes;
  showCardData: Boolean;
  isActive: boolean;
  subscription: Subscription;
  data: any;
  showModal: boolean = false;
  posicion: posiciones;
  turnOffForm: FormGroup;
  user: User;
  showErrors: Boolean;
  message:string;
  

  constructor(
    private dvcMotion: DeviceMotion,
    private vibration: Vibration,
    private flashlight: Flashlight,
    public audioManager: AudioManagerService,
    public platform: Platform,
    public formBuilder: FormBuilder,
    public authService: AuthService,
    public alertController: AlertController
  ) {
    this.showCardData = false;
    this.isActive = false;
    this.showModal = false;
    this.showErrors = false;
    this.user = new User();
  }

  get password() {
    return this.turnOffForm.get("password");
  }

  ngOnInit() {
    this.audioManager.cargarAudios();
    this.turnOffForm = this.formBuilder.group({
      password: ["", Validators.compose([Validators.required])],
    });
  }

  StartWatching() {
    console.log("Start watching MOTION");
    this.isActive = true;
    this.showCardData = true;
    this.posicion = posiciones.HORIZONTAL;
    this.subscription = this.dvcMotion
      .watchAcceleration({ frequency: 500 })
      .subscribe((acc: DeviceMotionAccelerationData) => {
        if (acc.x < -8.0 && this.posicion != posiciones.INCLINADODERECHA) {
          this.posicion = posiciones.INCLINADODERECHA;
          this.audioManager.stop("izquierda");
          this.audioManager.stop("horizontal");
          this.audioManager.reproducirAudio("derecha");
          this.showModal = true;
          console.log("derecha");
          //un sonido
        }
        //inclinado hacia la izquierda
        else if (
          acc.x > 8.0 &&
          this.posicion != posiciones.INCLINADOIZQUIERDA
        ) {
          this.posicion = posiciones.INCLINADOIZQUIERDA;
          this.audioManager.stop("derecha");
          this.audioManager.stop("horizontal");
          console.log("izquierda");
          this.audioManager.reproducirAudio("izquierda");
          //otro sonido
        }
        //vertical (portraid)
        else if (
          acc.x > -3.0 &&
          acc.x < 3.0 &&
          acc.y > 8.5 &&
          this.posicion != posiciones.VERTICAL
        ) {
          this.posicion = posiciones.VERTICAL;
          console.log("vertical");
          this.flashlight.switchOn();
          this.audioManager.stop("horizontal");
          this.audioManager.reproducirAudio("vertical");
          setTimeout(() => {
            this.flashlight.switchOff();
          }, 5000);
          //luz 5 sec + sonido
        }
        //horizontal(landscape)
        else if (
          acc.x > -3.0 &&
          acc.x < 3.0 &&
          acc.y < 1.0 &&
          acc.y > -1 &&
          this.posicion != posiciones.HORIZONTAL
        ) {
          this.posicion = posiciones.HORIZONTAL;
          this.audioManager.stop("izquierda");
          this.audioManager.stop("derecha");
          this.audioManager.stop("vertical");
          this.audioManager.reproducirAudio("horizontal");
          this.vibration.vibrate(5000);
          console.log("horizontal");
          //vibrar + sonido
        }
        this.data = acc;
        console.log(acc);
      });
  }

  StopWatching() {

    this.user.password = this.turnOffForm.get("password").value;
    this.user.email = JSON.parse(localStorage.getItem("user")).email;
    this.authService
      .SignIn(this.user.email, this.user.password)
      .then((res) => {
        this.hideModal();
        this.subscription.unsubscribe();
        this.audioManager.stop("izquierda");
        this.audioManager.stop("horizontal");
        this.audioManager.stop("derecha");
        this.audioManager.stop("vertical");
        this.isActive = false;
      })
      .catch((err) => {
        err.code == "auth/wrong-password" ? this.ShowErrors("La contraseña es incorrecta...") : this.ShowErrors("Ha ocurrido un error vuelva a intentar.")
      });
  }

  ShowErrors(message:string){
    this.showErrors = true;
    this.message = message;
    setTimeout(() => {
      this.showErrors = false;
    }, 3000);
  }

  hideModal(){
    this.showModal = false;
  }

    async presentAlertConfirm() {
      this.showModal = true;
/*     const alert = await this.alertController.create({
      cssClass: 'alert-desactivate',
      header: 'Ingrese contraseña para desactivar',
      message: "<form [formGroup]='turnOffForm'>" +
      "<ion-item lines='full' class='input-wrapper'>"+
      "<ion-label>Contraseña</ion-label>"+
      "<ion-input type='password' formControlName='password' required></ion-input>"+
      "</ion-item>",
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Desactivar',
          cssClass: "btn-desacat",
          handler: () => {
            this.StopWatching();
          }
        }
      ]
    });

    await alert.present(); */
  }

  CerrarSesion(){
    this.authService.SignOut();
  }
}
