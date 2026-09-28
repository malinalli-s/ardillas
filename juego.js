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

const textoPerdidas =
  document.querySelector("#perdidas");

const textoSiguiendo =
  document.querySelector("#siguiendo");

const resultado =
  document.querySelector("#resultado");


/* REGRESO */

const alertaRegreso =
  document.querySelector("#alertaRegreso");

const cuentaRegreso =
  document.querySelector("#cuentaRegreso");

const segundosRegreso =
  document.querySelector("#segundosRegreso");


/* PARALLAX */

const bosqueLejano =
  document.querySelector("#bosqueLejano");

const bosqueMedio =
  document.querySelector("#bosqueMedio");

const bosqueCercano =
  document.querySelector("#bosqueCercano");

const cielo =
  document.querySelector("#cielo");


/* =========================================
   ESTADO
========================================= */

let jugando = false;


/*
FASES:

exploracion
regreso
final
*/

let fase =
  "exploracion";


let alphaOrigen = 0;
let betaOrigen = 0;

let horizontalActual = 0;
let verticalActual = 0;


let salvadas = 0;
let perdidas = 0;


let ardillas = [];
let fuegos = [];


/* =========================================
   CONFIGURACIÓN
========================================= */

const minimoArdillas =
  12;


const intervaloFuego =
  3200;


/*
Ya no termina directamente
al llegar al máximo.

Aquí comienza el regreso.
*/

const fuegosParaRegresar =
  20;


/*
Segundos disponibles
para encontrar el agua.
*/

const tiempoParaRegresar =
  10;


const campoHorizontal =
  75;

const campoVertical =
  90;


/* =========================================
   TEMPORIZADORES
========================================= */

let temporizadorRegreso = null;

let segundosRestantes =
  tiempoParaRegresar;


/* =========================================
   AGUA
========================================= */

const agua =
  document.createElement(
    "button"
  );


agua.id =
  "agua";


agua.innerHTML =
  "≋";


agua.setAttribute(
  "aria-label",
  "Zona de agua"
);


mundo.appendChild(
  agua
);


const posicionAgua = {

  horizontal: 30,

  vertical: 15

};


/* =========================================
   INICIAR
========================================= */

botonIniciar.addEventListener(
  "click",
  iniciarJuego
);


async function iniciarJuego() {

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


      if (
        permiso !== "granted"
      ) {

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


  horizontalActual =
    0;


  verticalActual =
    0;


  jugando =
    true;


  fase =
    "exploracion";


  pantallaInicio.style.display =
    "none";


  /*
  Ardillas iniciales.
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
  El fuego comienza
  después de unos segundos.
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


  actualizarParallax();

  dibujarMundo();

}


/* =========================================
   PARALLAX
========================================= */

function actualizarParallax() {

  const lejanoX =
    horizontalActual * -0.25;


  const medioX =
    horizontalActual * -0.65;


  const cercanoX =
    horizontalActual * -1.25;


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

  if (
    !jugando ||
    fase !== "exploracion"
  ) {

    return;

  }


  const elemento =

    document.createElement(
      "button"
    );


  elemento.className =
    "ardilla";


  elemento.textContent =
    "🐿️";


  elemento.setAttribute(
    "aria-label",
    "Rescatar ardilla"
  );


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

    siguiendo: false,

    salvada: false,

    perdida: false,

    desapareciendo: false

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


  posicionarElemento(

    elemento,

    ardilla.horizontal,

    ardilla.vertical

  );

}


/* =========================================
   RECOGER ARDILLA
========================================= */

function recogerArdilla(
  ardilla
) {

  /*
  Durante la fase de regreso
  ya no podemos recoger más.
  */

  if (

    !jugando ||

    fase !== "exploracion" ||

    ardilla.siguiendo ||

    ardilla.salvada ||

    ardilla.perdida ||

    ardilla.desapareciendo

  ) {

    return;

  }


  ardilla.siguiendo =
    true;


  ardilla.elemento.style.display =
    "none";


  actualizarGrupo();


  reponerArdillas();


  mensaje.textContent =
    "TE SIGUE";


  setTimeout(
    () => {

      if (
        jugando &&
        fase === "exploracion"
      ) {

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

  if (

    !jugando ||

    fase !== "exploracion"

  ) {

    return;

  }


  const disponibles =

    ardillas.filter(

      ardilla =>

        !ardilla.siguiendo &&

        !ardilla.salvada &&

        !ardilla.perdida &&

        !ardilla.desapareciendo

    ).length;


  const faltantes =

    Math.max(

      0,

      minimoArdillas -
      disponibles

    );


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
  llegarAlAgua
);


function llegarAlAgua() {

  if (!jugando) return;


  const siguiendo =

    ardillas.filter(
      ardilla =>
        ardilla.siguiendo
    );


  /*
  EXPLORACIÓN NORMAL
  */

  if (
    fase === "exploracion"
  ) {

    if (
      siguiendo.length === 0
    ) {

      mensaje.textContent =
        "BUSCA ARDILLAS";

      return;

    }


    rescatarGrupo(
      siguiendo
    );


    mensaje.textContent =

      `${siguiendo.length} A SALVO`;


    reponerArdillas();

    return;

  }


  /*
  REGRESO FINAL
  */

  if (
    fase === "regreso"
  ) {

    if (
      siguiendo.length > 0
    ) {

      rescatarGrupo(
        siguiendo
      );

    }


    terminarJuego();

  }

}


/* =========================================
   RESCATAR GRUPO
========================================= */

function rescatarGrupo(
  siguiendo
) {

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

}


/* =========================================
   CREAR FUEGO
========================================= */

function crearFuego() {

  if (
    !jugando ||
    fase !== "exploracion"
  ) {

    return;

  }


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


  posicionarElemento(

    elemento,

    fuego.horizontal,

    fuego.vertical

  );


  /*
  Ambiente.
  */

  const progreso =

    fuegos.length /
    fuegosParaRegresar;


  humo.style.opacity =

    Math.min(
      progreso * .6,
      .6
    );


  if (cielo) {

    cielo.style.filter = `

      sepia(${progreso * .8})
      brightness(${1 - progreso * .35})

    `;

  }


  /*
  Revisamos contactos.
  */

  revisarColisiones();


  /*
  Hemos llegado al punto
  crítico del incendio.
  */

  if (

    fuegos.length >=
    fuegosParaRegresar

  ) {

    iniciarRegreso();

    return;

  }


  setTimeout(
    crearFuego,
    intervaloFuego
  );

}


/* =========================================
   COLISIONES
========================================= */

function revisarColisiones() {

  if (!jugando) return;


  ardillas.forEach(
    ardilla => {


      if (

        ardilla.siguiendo ||

        ardilla.salvada ||

        ardilla.perdida ||

        ardilla.desapareciendo

      ) {

        return;

      }


      fuegos.forEach(
        fuego => {


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

            distanciaX < 10 &&

            distanciaY < 10

          ) {

            alcanzarArdilla(
              ardilla
            );

          }

        }
      );

    }
  );

}


/* =========================================
   ARDILLA ALCANZADA
========================================= */

function alcanzarArdilla(
  ardilla
) {

  if (

    ardilla.perdida ||

    ardilla.desapareciendo ||

    ardilla.siguiendo ||

    ardilla.salvada

  ) {

    return;

  }


  ardilla.desapareciendo =
    true;


  /*
  Ya no puede rescatarse.
  */

  ardilla.elemento.style
    .pointerEvents =
    "none";


  /*
  Primero se vuelve roja
  y posteriormente desaparece.
  */

  ardilla.elemento.classList.add(
    "alcanzada"
  );


  /*
  1.5 segundos coincide
  con la animación CSS.
  */

  setTimeout(
    () => {

      ardilla.perdida =
        true;


      ardilla.desapareciendo =
        false;


      ardilla.elemento.remove();


      perdidas++;


      textoPerdidas.textContent =
        perdidas;


      /*
      Sólo reponemos durante
      la exploración.
      */

      if (
        jugando &&
        fase === "exploracion"
      ) {

        reponerArdillas();

      }

    },

    1500
  );

}


/* =========================================
   INICIAR REGRESO
========================================= */

function iniciarRegreso() {

  if (
    !jugando ||
    fase !== "exploracion"
  ) {

    return;

  }


  fase =
    "regreso";


  /*
  Ya no aparecen más fuegos
  ni más ardillas.
  */


  /*
  Primero mostramos
  el mensaje grande.
  */

  alertaRegreso.style.display =
    "flex";


  mensaje.textContent =
    "";


  /*
  Lo dejamos visible
  durante 2 segundos.
  */

  setTimeout(
    () => {

      if (
        !jugando ||
        fase !== "regreso"
      ) {

        return;

      }


      alertaRegreso.style.display =
        "none";


      comenzarCuentaRegreso();

    },

    2000
  );

}


/* =========================================
   CUENTA REGRESIVA
========================================= */

function comenzarCuentaRegreso() {

  segundosRestantes =
    tiempoParaRegresar;


  cuentaRegreso.style.display =
    "block";


  segundosRegreso.textContent =
    segundosRestantes;


  mensaje.textContent =
    "BUSCA EL AGUA";


  temporizadorRegreso =

    setInterval(
      () => {


        segundosRestantes--;


        segundosRegreso.textContent =
          segundosRestantes;


        /*
        Los últimos segundos
        pueden sentirse más urgentes.
        */

        if (
          segundosRestantes <= 3
        ) {

          cuentaRegreso.style.transform = `

            translateX(-50%)
            scale(1.15)

          `;

        }


        /*
        No llegó al agua.
        */

        if (
          segundosRestantes <= 0
        ) {

          clearInterval(
            temporizadorRegreso
          );


          terminarJuego();

        }

      },

      1000
    );

}


/* =========================================
   DIBUJAR MUNDO
========================================= */

function dibujarMundo() {

  if (!jugando) return;


  /*
  ARDILLAS
  */

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


  /*
  FUEGO
  */

  fuegos.forEach(
    fuego => {

      posicionarElemento(

        fuego.elemento,

        fuego.horizontal,

        fuego.vertical

      );

    }
  );


  /*
  AGUA
  */

  posicionarElemento(

    agua,

    posicionAgua.horizontal,

    posicionAgua.vertical

  );


  revisarColisiones();

}


/* =========================================
   POSICIONAR ELEMENTO
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

  if (!jugando) return;


  jugando =
    false;


  fase =
    "final";


  if (
    temporizadorRegreso
  ) {

    clearInterval(
      temporizadorRegreso
    );

  }


  cuentaRegreso.style.display =
    "none";


  alertaRegreso.style.display =
    "none";


  window.removeEventListener(
    "deviceorientation",
    actualizarOrientacion
  );


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
   NORMALIZAR ÁNGULO
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


/* =========================================
   ALEATORIO
========================================= */

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
