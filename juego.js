/* =========================================
   DOM
========================================= */

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


/* PARALLAX */

const bosqueLejano =
  document.querySelector("#bosqueLejano");

const bosqueMedio =
  document.querySelector("#bosqueMedio");

const bosqueCercano =
  document.querySelector("#bosqueCercano");


/* =========================================
   ESTADO
========================================= */

let jugando = false;

let alphaOrigen = 0;
let betaOrigen = 0;

let horizontalActual = 0;
let verticalActual = 0;

let salvadas = 0;

let ardillas = [];
let fuegos = [];


/* =========================================
   CONFIGURACIÓN
========================================= */

const minimoArdillas = 12;

const intervaloFuego = 3200;

const maximoFuegos = 26;


/* =========================================
   AGUA
========================================= */

const agua =
  document.createElement("button");

agua.id = "agua";

agua.innerHTML = "≋";

mundo.appendChild(agua);


const posicionAgua = {

  horizontal: 30,

  vertical: 15

};


/* =========================================
   INICIO
========================================= */

botonIniciar.addEventListener(
  "click",
  iniciarJuego
);


async function iniciarJuego() {

  /*
  iOS requiere permiso.
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


/* =========================================
   CALIBRAR
========================================= */

function calibrar(evento) {

  alphaOrigen =
    evento.alpha || 0;

  betaOrigen =
    evento.beta || 0;


  horizontalActual = 0;
  verticalActual = 0;


  pantallaInicio.style.display =
    "none";


  jugando = true;


  /*
  Poblamos el bosque.
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


  mensaje.textContent =
    "GIRA PARA BUSCAR";


  /*
  Primer fuego después
  de unos segundos.
  */

  setTimeout(
    crearFuego,
    4500
  );


  dibujarMundo();

}


/* =========================================
   ORIENTACIÓN
========================================= */

function actualizarOrientacion(evento) {

  if (!jugando) return;


  horizontalActual =

    normalizarAngulo(

      (evento.alpha || 0)
      - alphaOrigen

    );


  verticalActual =

    (evento.beta || 0)
    - betaOrigen;


  actualizarParallax();

  dibujarMundo();

}


/* =========================================
   PARALLAX
========================================= */

function actualizarParallax() {

  /*
  La capa lejana se mueve poco.

  La capa cercana se mueve mucho.

  El signo negativo hace que el paisaje
  responda en dirección contraria al giro.
  */

  const lejanoX =
    horizontalActual * -0.25;

  const medioX =
    horizontalActual * -0.65;

  const cercanoX =
    horizontalActual * -1.25;


  /*
  También permitimos un pequeño
  desplazamiento vertical.
  */

  const lejanoY =
    verticalActual * -0.08;

  const medioY =
    verticalActual * -0.15;

  const cercanoY =
    verticalActual * -0.25;


  bosqueLejano.style.transform = `

    translate(
      ${lejanoX}px,
      ${lejanoY}px
    )

  `;


  bosqueMedio.style.transform = `

    translate(
      ${medioX}px,
      ${medioY}px
    )

  `;


  bosqueCercano.style.transform = `

    translate(
      ${cercanoX}px,
      ${cercanoY}px
    )

  `;

}


/* =========================================
   CREAR ARDILLA
========================================= */

function crearArdilla() {

  if (!jugando) return;


  const elemento =
    document.createElement(
      "button"
    );


  elemento.className =
    "ardilla";


  elemento.textContent =
    "🐿️";


  mundo.appendChild(
    elemento
  );


  const ardilla = {

    elemento,

    horizontal:
      numeroAleatorio(
        -180,
        180
      ),

    vertical:
      numeroAleatorio(
        -32,
        32
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
    () => {

      recogerArdilla(
        ardilla
      );

    }
  );


  ardillas.push(
    ardilla
  );

}


/* =========================================
   RECOGER ARDILLA
========================================= */

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


  /*
  IMPORTANTE:

  Antes aquí terminábamos entrando
  indirectamente en un while infinito.

  Ahora simplemente comprobamos
  cuántas quedan y generamos
  exactamente las necesarias.
  */

  reponerArdillas();


  mensaje.textContent =
    "TE SIGUE";


  setTimeout(
    () => {

      if (jugando) {

        mensaje.textContent =
          "¿UNA MÁS?";

      }

    },
    800
  );

}


/* =========================================
   REPONER ARDILLAS
========================================= */

function reponerArdillas() {

  if (!jugando) return;


  const disponibles =

    ardillas.filter(

      ardilla =>

        !ardilla.siguiendo &&
        !ardilla.salvada &&
        !ardilla.perdida

    ).length;


  const faltantes =

    Math.max(

      0,

      minimoArdillas -
      disponibles

    );


  /*
  Ya NO usamos while.

  Si quedan 11 y queremos 12,
  simplemente creamos 1.
  */

  for (
    let i = 0;
    i < faltantes;
    i++
  ) {

    crearArdilla();

  }

}


/* =========================================
   GRUPO
========================================= */

function actualizarGrupo() {

  const siguiendo =

    ardillas.filter(
      ardilla =>
        ardilla.siguiendo
    );


  textoSiguiendo.textContent =
    siguiendo.length;


  /*
  Evitamos que 20 emojis
  destruyan la interfaz.
  */

  const visibles =
    Math.min(
      siguiendo.length,
      8
    );


  grupo.textContent =

    "🐿️".repeat(
      visibles
    );


  if (
    siguiendo.length > 8
  ) {

    grupo.textContent +=
      ` +${siguiendo.length - 8}`;

  }

}


/* =========================================
   AGUA
========================================= */

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

  reponerArdillas();


  mensaje.textContent =

    `${siguiendo.length} A SALVO`;

}


/* =========================================
   FUEGO
========================================= */

function crearFuego() {

  if (!jugando) return;


  const elemento =
    document.createElement(
      "div"
    );


  elemento.className =
    "fuego";


  elemento.textContent =
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
        -35,
        35
      )

  };


  fuegos.push(
    fuego
  );


  revisarArdillasEnPeligro(
    fuego
  );


  /*
  Cada vez hay más humo.
  */

  const progreso =

    fuegos.length /
    maximoFuegos;


  humo.style.opacity =

    Math.min(
      progreso * .6,
      .6
    );


  /*
  El color general del cielo
  también se deteriora.
  */

  document
    .querySelector("#cielo")
    .style
    .filter = `

      sepia(${progreso * .8})
      brightness(${1 - progreso * .35})

    `;


  dibujarMundo();


  if (
    fuegos.length >=
    maximoFuegos
  ) {

    terminarJuego();

    return;

  }


  setTimeout(
    crearFuego,
    intervaloFuego
  );

}


/* =========================================
   ARDILLA CERCA DEL FUEGO
========================================= */

function revisarArdillasEnPeligro(
  fuego
) {

  ardillas.forEach(
    ardilla => {


      /*
      Si ya está contigo,
      el fuego no se la lleva.
      */

      if (

        ardilla.siguiendo ||
        ardilla.salvada ||
        ardilla.perdida

      ) {

        return;

      }


      const distanciaX =

        Math.abs(

          normalizarAngulo(

            ardilla.horizontal -
            fuego.horizontal

          )

        );


      const distanciaY =

        Math.abs(

          ardilla.vertical -
          fuego.vertical

        );


      if (

        distanciaX < 16 &&
        distanciaY < 16

      ) {

        ardilla.perdida =
          true;


        ardilla.elemento.remove();

      }

    }
  );


  reponerArdillas();

}


/* =========================================
   DIBUJAR MUNDO
========================================= */

function dibujarMundo() {

  if (!jugando) return;


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

        ardilla.vertical

      );

    }
  );


  fuegos.forEach(
    fuego => {

      posicionarElemento(

        fuego.elemento,

        fuego.horizontal,

        fuego.vertical

      );

    }
  );


  posicionarElemento(

    agua,

    posicionAgua.horizontal,

    posicionAgua.vertical

  );

}


/* =========================================
   POSICIÓN EN EL CAMPO VISUAL
========================================= */

function posicionarElemento(

  elemento,

  posicionHorizontal,

  posicionVertical

) {

  const ancho =
    window.innerWidth;

  const alto =
    window.innerHeight;


  const campoHorizontal =
    75;

  const campoVertical =
    90;


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
    campoHorizontal *
    ancho;


  const y =

    diferenciaY /
    campoVertical *
    alto;


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


/* =========================================
   FINAL
========================================= */

function terminarJuego() {

  jugando = false;


  resultado.textContent =
    salvadas;


  pantallaFinal.style.display =
    "flex";

}


/* =========================================
   REINICIAR
========================================= */

botonReiniciar.addEventListener(
  "click",
  () => {

    location.reload();

  }
);


/* =========================================
   UTILIDADES
========================================= */

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
