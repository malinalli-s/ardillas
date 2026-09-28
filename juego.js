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

const mundo =
  document.querySelector("#mundo");

const humo =
  document.querySelector("#humo");

const mensaje =
  document.querySelector("#mensaje");

const grupo =
  document.querySelector("#grupo");

const textoSalvadas =
  document.querySelector("#salvadas");

const textoSiguiendo =
  document.querySelector("#siguiendo");

const resultado =
  document.querySelector("#resultado");


/* ==========================================
   ESTADO
========================================== */

let jugando = false;

let alphaOrigen = 0;
let betaOrigen = 0;

let horizontalActual = 0;
let verticalActual = 0;

let salvadas = 0;

let ardillas = [];
let fuegos = [];

let contadorArdillas = 0;


/* ==========================================
   CONFIGURACIÓN
========================================== */

/*
Queremos que siempre parezca
que existen más ardillas.
*/

const minimoArdillas = 10;


/*
Cada cuánto aparece fuego.
Menor número = más difícil.
*/

const intervaloFuego = 3500;


/*
Número de focos de fuego
antes del final.
*/

const maximoFuegos = 24;


/*
Cada cuánto comprobamos
si necesitamos nuevas ardillas.
*/

const intervaloArdillas = 2500;


/* ==========================================
   AGUA
========================================== */

const agua = document.createElement(
  "button"
);

agua.id = "agua";
agua.innerHTML = "≋";

mundo.appendChild(agua);


/*
El agua está fija en una
dirección del mundo.
*/

const posicionAgua = {

  horizontal: 20,
  vertical: 10

};


/* ==========================================
   INICIAR
========================================== */

botonIniciar.addEventListener(
  "click",
  iniciarJuego
);


async function iniciarJuego() {

  /*
  Permiso necesario
  principalmente en iPhone.
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


  window.addEventListener(
    "deviceorientation",
    calibrar,
    { once: true }
  );

}


/* ==========================================
   CALIBRACIÓN
========================================== */

function calibrar(evento) {

  alphaOrigen =
    evento.alpha || 0;

  betaOrigen =
    evento.beta || 0;


  pantallaInicio.style.display =
    "none";


  jugando = true;


  /*
  Generamos las primeras
  ardillas.
  */

  for (
    let i = 0;
    i < minimoArdillas;
    i++
  ) {

    crearArdilla();

  }


  window.addEventListener(
    "deviceorientation",
    actualizarOrientacion
  );


  /*
  El incendio empieza
  poco después.
  */

  setTimeout(
    crearFuego,
    4000
  );


  setInterval(
    mantenerArdillas,
    intervaloArdillas
  );


  dibujarMundo();

}


/* ==========================================
   ORIENTACIÓN
========================================== */

function actualizarOrientacion(
  evento
) {

  if (!jugando) return;


  horizontalActual =

    normalizarAngulo(

      (evento.alpha || 0)
      - alphaOrigen

    );


  verticalActual =

    (evento.beta || 0)
    - betaOrigen;


  dibujarMundo();

}


/* ==========================================
   CREAR ARDILLA
========================================== */

function crearArdilla() {

  if (!jugando) return;


  const elemento =
    document.createElement(
      "button"
    );


  elemento.className =
    "ardilla";


  elemento.innerHTML =
    "🐿️";


  mundo.appendChild(
    elemento
  );


  const ardilla = {

    id:
      contadorArdillas++,

    elemento,

    horizontal:
      numeroAleatorio(
        -180,
        180
      ),

    vertical:
      numeroAleatorio(
        -35,
        35
      ),

    siguiendo:
      false,

    salvada:
      false,

    perdida:
      false

  };


  elemento.addEventListener(
    "click",
    () =>
      recogerArdilla(
        ardilla
      )
  );


  ardillas.push(
    ardilla
  );

}


/* ==========================================
   RECOGER ARDILLA
========================================== */

function recogerArdilla(
  ardilla
) {

  if (
    !jugando ||
    ardilla.siguiendo ||
    ardilla.salvada ||
    ardilla.perdida
  ) {

    return;

  }


  ardilla.siguiendo =
    true;


  ardilla.elemento.style.display =
    "none";


  actualizarGrupo();


  mensaje.textContent =
    "TE SIGUE";


  /*
  Poco después dejamos
  de mostrar el mensaje.
  */

  setTimeout(
    () => {

      if (jugando) {

        mensaje.textContent =
          "¿UNA MÁS?";

      }

    },
    900
  );

}


/* ==========================================
   GRUPO
========================================== */

function actualizarGrupo() {

  const siguiendo =

    ardillas.filter(
      ardilla =>
        ardilla.siguiendo
    );


  textoSiguiendo.textContent =
    siguiendo.length;


  grupo.textContent =

    "🐿️".repeat(
      siguiendo.length
    );

}


/* ==========================================
   RESCATAR EN EL AGUA
========================================== */

agua.addEventListener(
  "click",
  rescatar
);


function rescatar() {

  if (!jugando) return;


  const siguiendo =

    ardillas.filter(
      ardilla =>
        ardilla.siguiendo
    );


  if (
    siguiendo.length === 0
  ) {

    mensaje.textContent =
      "BUSCA ARDILLAS";

    return;

  }


  siguiendo.forEach(
    ardilla => {

      ardilla.siguiendo =
        false;

      ardilla.salvada =
        true;

    }
  );


  salvadas +=
    siguiendo.length;


  textoSalvadas.textContent =
    salvadas;


  actualizarGrupo();


  mensaje.textContent =
    `${siguiendo.length} A SALVO`;


  /*
  Inmediatamente hacemos
  aparecer nuevas posibilidades.
  */

  mantenerArdillas();

}


/* ==========================================
   MANTENER ARDILLAS
========================================== */

function mantenerArdillas() {

  if (!jugando) return;


  const disponibles =

    ardillas.filter(
      ardilla =>

        !ardilla.siguiendo &&
        !ardilla.salvada &&
        !ardilla.perdida

    );


  /*
  Siempre mantenemos muchas
  posibilidades alrededor.
  */

  while (
    disponibles.length +
    contarNuevasPendientes()
    < minimoArdillas
  ) {

    crearArdilla();

  }

}


/*
Esta función queda simple
porque crearArdilla es inmediato.
*/

function contarNuevasPendientes() {

  return 0;

}


/* ==========================================
   CREAR FUEGO
========================================== */

function crearFuego() {

  if (!jugando) return;


  const elemento =
    document.createElement(
      "div"
    );


  elemento.className =
    "fuego";


  elemento.innerHTML =
    "🔥";


  mundo.appendChild(
    elemento
  );


  const fuego = {

    elemento,

    horizontal:
      numeroAleatorio(
        -180,
        180
      ),

    vertical:
      numeroAleatorio(
        -40,
        40
      )

  };


  fuegos.push(
    fuego
  );


  /*
  Cada nuevo fuego aumenta
  ligeramente el humo.
  */

  humo.style.opacity =

    Math.min(
      fuegos.length /
      maximoFuegos * .65,
      .65
    );


  /*
  Revisamos si alguna ardilla
  estaba cerca del nuevo fuego.
  */

  revisarArdillasEnPeligro(
    fuego
  );


  /*
  Final.
  */

  if (
    fuegos.length >=
    maximoFuegos
  ) {

    terminarJuego();

    return;

  }


  /*
  Próximo foco.
  */

  setTimeout(
    crearFuego,
    intervaloFuego
  );


  dibujarMundo();

}


/* ==========================================
   ARDILLAS EN PELIGRO
========================================== */

function revisarArdillasEnPeligro(
  fuego
) {

  ardillas.forEach(
    ardilla => {


      /*
      Las que ya te siguen
      no desaparecen.
      Las estás transportando.
      */

      if (
        ardilla.siguiendo ||
        ardilla.salvada ||
        ardilla.perdida
      ) {

        return;

      }


      const distanciaHorizontal =

        Math.abs(

          normalizarAngulo(

            ardilla.horizontal -
            fuego.horizontal

          )

        );


      const distanciaVertical =

        Math.abs(

          ardilla.vertical -
          fuego.vertical

        );


      /*
      Si aparece fuego muy
      cerca de una ardilla,
      deja de estar disponible.
      */

      if (
        distanciaHorizontal < 18 &&
        distanciaVertical < 18
      ) {

        ardilla.perdida =
          true;


        ardilla.elemento
          .remove();

      }

    }
  );


  mantenerArdillas();

}


/* ==========================================
   DIBUJAR TODO
========================================== */

function dibujarMundo() {

  if (!jugando) return;


  const ancho =
    window.innerWidth;

  const alto =
    window.innerHeight;


  const campoHorizontal =
    75;

  const campoVertical =
    90;


  /* =====================
     ARDILLAS
  ===================== */

  ardillas.forEach(
    ardilla => {


      if (
        ardilla.siguiendo ||
        ardilla.salvada ||
        ardilla.perdida
      ) {

        return;

      }


      posicionarElemento(

        ardilla.elemento,

        ardilla.horizontal,

        ardilla.vertical,

        ancho,

        alto,

        campoHorizontal,

        campoVertical

      );

    }
  );


  /* =====================
     FUEGOS
  ===================== */

  fuegos.forEach(
    fuego => {

      posicionarElemento(

        fuego.elemento,

        fuego.horizontal,

        fuego.vertical,

        ancho,

        alto,

        campoHorizontal,

        campoVertical

      );

    }
  );


  /* =====================
     AGUA
  ===================== */

  posicionarElemento(

    agua,

    posicionAgua.horizontal,

    posicionAgua.vertical,

    ancho,

    alto,

    campoHorizontal,

    campoVertical

  );

}


/* ==========================================
   POSICIONAR OBJETO 360
========================================== */

function posicionarElemento(

  elemento,

  posicionHorizontal,

  posicionVertical,

  ancho,

  alto,

  campoHorizontal,

  campoVertical

) {

  let diferenciaX =

    posicionHorizontal -
    horizontalActual;


  diferenciaX =
    normalizarAngulo(
      diferenciaX
    );


  const diferenciaY =

    posicionVertical -
    verticalActual;


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
      < ancho * .62

    &&

    Math.abs(y)
      < alto * .60;


  if (!visible) {

    elemento.style.display =
      "none";

    return;

  }


  elemento.style.display =
    "block";


  elemento.style.transform = `

    translate(
      calc(-50% + ${x}px),
      calc(-50% + ${y}px)
    )

  `;

}


/* ==========================================
   FINAL
========================================== */

function terminarJuego() {

  jugando = false;


  resultado.textContent =
    salvadas;


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
   UTILIDADES
========================================== */

function normalizarAngulo(
  angulo
) {

  while (
    angulo > 180
  ) {

    angulo -= 360;

  }


  while (
    angulo < -180
  ) {

    angulo += 360;

  }


  return angulo;

}


function numeroAleatorio(
  minimo,
  maximo
) {

  return (

    Math.random()
    * (maximo - minimo)
    + minimo

  );

}
