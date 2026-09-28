/* ==========================================
   ELEMENTOS
========================================== */

const botonIniciar =
  document.querySelector("#iniciar");

const botonReiniciar =
  document.querySelector("#reiniciar");

const pantallaInicio =
  document.querySelector("#inicio");

const pantallaFinal =
  document.querySelector("#final");

const resultado =
  document.querySelector("#resultado");

const textoSalvadas =
  document.querySelector("#salvadas");

const textoSiguiendo =
  document.querySelector("#siguiendo");

const grupo =
  document.querySelector("#grupo");

const mensaje =
  document.querySelector("#mensaje");

const fuego =
  document.querySelector("#fuego");

const agua =
  document.querySelector("#agua");

const elementosArdillas =
  document.querySelectorAll(".ardilla");


/* ==========================================
   MUNDO
========================================== */

const ardillas = [

  { angulo: -150, vertical: -15 },
  { angulo: -105, vertical: 20 },
  { angulo: -65,  vertical: -25 },
  { angulo: -20,  vertical: 15 },

  { angulo: 35,   vertical: -20 },
  { angulo: 80,   vertical: 25 },
  { angulo: 130,  vertical: -10 },
  { angulo: 170,  vertical: 18 }

];


ardillas.forEach(
  (ardilla, indice) => {

    ardilla.elemento =
      elementosArdillas[indice];

    ardilla.siguiendo =
      false;

    ardilla.salvada =
      false;

  }
);


/*
El agua también vive
en el mundo de 360°.
*/

const posicionAgua = {

  angulo: 10,
  vertical: 5

};


/* ==========================================
   ESTADO
========================================== */

let alphaOrigen = 0;
let betaOrigen = 0;

let jugando = false;

let numeroSiguiendo = 0;
let numeroSalvadas = 0;


/*
El incendio durará
75 segundos.
*/

const duracionIncendio =
  75000;


let inicioIncendio = 0;
let animacion;


/* ==========================================
   INICIAR
========================================== */

botonIniciar.addEventListener(
  "click",
  iniciarJuego
);


async function iniciarJuego() {

  /*
  iPhone necesita permiso
  explícito para orientación.
  */

  if (
    typeof DeviceOrientationEvent !==
    "undefined"

    &&

    typeof DeviceOrientationEvent
      .requestPermission ===
    "function"
  ) {

    try {

      const permiso =

        await DeviceOrientationEvent
          .requestPermission();


      if (permiso !== "granted") {

        mensaje.textContent =
          "SE NECESITA ACCESO AL MOVIMIENTO";

        return;

      }

    }

    catch (error) {

      console.error(error);

      return;

    }

  }


  /*
  Tomamos la primera posición
  como origen.
  */

  window.addEventListener(
    "deviceorientation",
    calibrar,
    { once: true }
  );

}


/* ==========================================
   CALIBRAR
========================================== */

function calibrar(evento) {

  alphaOrigen =
    evento.alpha || 0;

  betaOrigen =
    evento.beta || 0;


  pantallaInicio.style.display =
    "none";


  jugando =
    true;


  inicioIncendio =
    performance.now();


  window.addEventListener(
    "deviceorientation",
    actualizarOrientacion
  );


  mensaje.textContent =
    "GIRA PARA BUSCAR";


  actualizarFuego();

}


/* ==========================================
   ORIENTACIÓN
========================================== */

function actualizarOrientacion(evento) {

  if (!jugando) return;


  let horizontal =

    (evento.alpha || 0)

    - alphaOrigen;


  horizontal =
    normalizarAngulo(
      horizontal
    );


  const vertical =

    (evento.beta || 0)

    - betaOrigen;


  dibujarMundo(
    horizontal,
    vertical
  );

}


/* ==========================================
   DIBUJAR MUNDO
========================================== */

function dibujarMundo(
  horizontal,
  vertical
) {

  const ancho =
    window.innerWidth;

  const alto =
    window.innerHeight;


  const campoHorizontal =
    70;

  const campoVertical =
    90;


  /* =========================
     ARDILLAS
  ========================= */

  ardillas.forEach(
    ardilla => {


      if (
        ardilla.siguiendo ||
        ardilla.salvada
      ) {

        ardilla.elemento.style.display =
          "none";

        return;

      }


      let diferenciaX =

        ardilla.angulo -
        horizontal;


      diferenciaX =
        normalizarAngulo(
          diferenciaX
        );


      const diferenciaY =

        ardilla.vertical -
        vertical;


      const x =

        diferenciaX /
        campoHorizontal

        * ancho;


      const y =

        diferenciaY /
        campoVertical

        * alto;


      const visible =

        Math.abs(x)
          < ancho * 0.58

        &&

        Math.abs(y)
          < alto * 0.55;


      if (!visible) {

        ardilla.elemento.style.display =
          "none";

        return;

      }


      ardilla.elemento.style.display =
        "block";


      ardilla.elemento.style.transform = `

        translate(
          calc(-50% + ${x}px),
          calc(-50% + ${y}px)
        )

      `;

    }
  );


  /* =========================
     AGUA
  ========================= */

  let diferenciaAguaX =

    posicionAgua.angulo -
    horizontal;


  diferenciaAguaX =
    normalizarAngulo(
      diferenciaAguaX
    );


  const diferenciaAguaY =

    posicionAgua.vertical -
    vertical;


  const aguaX =

    diferenciaAguaX /
    campoHorizontal

    * ancho;


  const aguaY =

    diferenciaAguaY /
    campoVertical

    * alto;


  const aguaVisible =

    Math.abs(aguaX)
      < ancho * .65

    &&

    Math.abs(aguaY)
      < alto * .6;


  if (aguaVisible) {

    agua.style.display =
      "block";


    agua.style.transform = `

      translate(
        calc(-50% + ${aguaX}px),
        calc(-50% + ${aguaY}px)
      )

    `;

  }

  else {

    agua.style.display =
      "none";

  }

}


/* ==========================================
   TAP EN ARDILLA
========================================== */

ardillas.forEach(
  ardilla => {

    ardilla.elemento.addEventListener(
      "click",
      () => seleccionarArdilla(ardilla)
    );

  }
);


function seleccionarArdilla(
  ardilla
) {

  if (
    !jugando ||
    ardilla.siguiendo ||
    ardilla.salvada
  ) {

    return;

  }


  ardilla.siguiendo =
    true;


  numeroSiguiendo++;


  ardilla.elemento.style.display =
    "none";


  actualizarGrupo();


  mensaje.textContent =
    "AHORA LLÉVALA AL AGUA";

}


/* ==========================================
   ARDILLAS SIGUIENDO
========================================== */

function actualizarGrupo() {

  textoSiguiendo.textContent =
    numeroSiguiendo;


  grupo.textContent =
    "🐿️".repeat(
      numeroSiguiendo
    );

}


/* ==========================================
   AGUA
========================================== */

agua.addEventListener(
  "click",
  rescatar
);


function rescatar() {

  if (
    !jugando ||
    numeroSiguiendo === 0
  ) {

    mensaje.textContent =
      "ENCUENTRA ARDILLAS";

    return;

  }


  ardillas.forEach(
    ardilla => {

      if (ardilla.siguiendo) {

        ardilla.siguiendo =
          false;

        ardilla.salvada =
          true;

      }

    }
  );


  numeroSalvadas +=
    numeroSiguiendo;


  numeroSiguiendo =
    0;


  textoSalvadas.textContent =
    numeroSalvadas;


  actualizarGrupo();


  mensaje.textContent =
    "ESTÁN A SALVO";


  /*
  Si encontramos todas,
  terminamos antes.
  */

  if (
    numeroSalvadas ===
    ardillas.length
  ) {

    terminarJuego();

  }

}


/* ==========================================
   FUEGO
========================================== */

function actualizarFuego() {

  if (!jugando) return;


  const ahora =
    performance.now();


  const transcurrido =

    ahora -
    inicioIncendio;


  const progreso =

    Math.min(

      transcurrido /
      duracionIncendio,

      1

    );


  /*
  El fuego sube visualmente.
  */

  fuego.style.height =

    `${progreso * 100}%`;


  /*
  Avisos simples.
  */

  if (
    progreso > .75 &&
    numeroSiguiendo > 0
  ) {

    mensaje.textContent =
      "REGRESA AL AGUA";

  }


  if (progreso >= 1) {

    terminarJuego();

    return;

  }


  animacion =
    requestAnimationFrame(
      actualizarFuego
    );

}


/* ==========================================
   FINAL
========================================== */

function terminarJuego() {

  if (!jugando) return;


  jugando =
    false;


  cancelAnimationFrame(
    animacion
  );


  resultado.textContent =
    numeroSalvadas;


  pantallaFinal.style.display =
    "flex";

}


/* ==========================================
   REINICIAR
========================================== */

botonReiniciar.addEventListener(
  "click",
  () => {

    location.reload();

  }
);


/* ==========================================
   UTILIDAD
========================================== */

function normalizarAngulo(
  angulo
) {

  while (angulo > 180) {

    angulo -= 360;

  }


  while (angulo < -180) {

    angulo += 360;

  }


  return angulo;

}
