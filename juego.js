/* =========================================
   ELEMENTOS DEL DOM
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


/* =========================================
   REGRESO FINAL
========================================= */

const alertaRegreso =
  document.querySelector("#alertaRegreso");

const cuentaRegreso =
  document.querySelector("#cuentaRegreso");

const segundosRegreso =
  document.querySelector("#segundosRegreso");


/* =========================================
   CAPAS PARALLAX
========================================= */

const bosqueLejano =
  document.querySelector("#bosqueLejano");

const bosqueMedio =
  document.querySelector("#bosqueMedio");

const bosqueCercano =
  document.querySelector("#bosqueCercano");

const cielo =
  document.querySelector("#cielo");


/* =========================================
   ESTADO GENERAL
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


/* orientación */

let alphaOrigen = 0;
let betaOrigen = 0;

let horizontalActual = 0;
let verticalActual = 0;


/* resultados */

let salvadas = 0;
let perdidas = 0;


/* objetos del mundo */

let ardillas = [];
let fuegos = [];


/* =========================================
   CONFIGURACIÓN
========================================= */


/*
Cantidad mínima de ardillas
libres en el bosque.

Cuando recoges o pierdes una,
el sistema genera otra.
*/

const minimoArdillas =
  12;


/*
Tiempo entre nuevas llamas.
*/

const intervaloFuego =
  3200;


/*
Cuando existen 20 focos
comienza la fase de regreso.
*/

const fuegosParaRegresar =
  20;


/*
Tiempo para encontrar
el agua al final.
*/

const tiempoParaRegresar =
  10;


/*
Campo visual.

Un valor vertical menor
hace más sensible el
movimiento arriba/abajo.
*/

const campoHorizontal =
  75;

const campoVertical =
  60;


/*
Sensibilidad vertical.
*/

const sensibilidadVertical =
  1.5;


/* =========================================
   TEMPORIZADORES
========================================= */

let temporizadorRegreso =
  null;

let segundosRestantes =
  tiempoParaRegresar;


/* =========================================
   CREAR AGUA
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


/*
Posición del agua.

Horizontal:
-180 a 180

Vertical:
negativo = arriba
positivo = abajo
*/

const posicionAgua = {

  horizontal: 30,

  vertical: 35

};


/* =========================================
   BOTÓN EMPEZAR
========================================= */

botonIniciar.addEventListener(
  "click",
  iniciarJuego
);


async function iniciarJuego() {

  /*
  En iPhone/iPad necesitamos
  pedir permiso para utilizar
  DeviceOrientation.
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


      if (
        permiso !== "granted"
      ) {

        mensaje.textContent =
          "SE NECESITA ACCESO AL MOVIMIENTO";

        return;

      }

    }

    catch (error) {

      console.error(
        "Error al solicitar orientación:",
        error
      );

      return;

    }

  }


  /*
  El primer dato del sensor
  sirve como punto cero.
  */

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


  /*
  Ocultamos la nueva
  pantalla ilustrada.
  */

  pantallaInicio.style.display =
    "none";


  /*
  Creamos las primeras
  ardillas.
  */

  for (
    let i = 0;
    i < minimoArdillas;
    i++
  ) {

    crearArdilla();

  }


  /*
  Comenzamos a escuchar
  el sensor.
  */

  window.addEventListener(
    "deviceorientation",
    actualizarOrientacion
  );


  mensaje.textContent =
    "GIRA PARA BUSCAR";


  /*
  Primer fuego.
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


  /*
  GIRO HORIZONTAL
  */

  horizontalActual =

    normalizarAngulo(

      (evento.alpha || 0)
      - alphaOrigen

    );


  /*
  MOVIMIENTO VERTICAL

  Amplificamos beta para
  hacer perceptible mirar
  arriba y abajo.
  */

  verticalActual =

    (
      (evento.beta || 0)
      - betaOrigen
    )

    * sensibilidadVertical;


  actualizarParallax();

  dibujarMundo();

}


/* =========================================
   PARALLAX
========================================= */

function actualizarParallax() {

  /*
  Cuanto más cerca está
  una capa, más se desplaza.
  */

  const lejanoX =
    horizontalActual * -0.25;


  const medioX =
    horizontalActual * -0.65;


  const cercanoX =
    horizontalActual * -1.25;


  /*
  Parallax vertical.
  */

  const lejanoY =
    verticalActual * -0.08;


  const medioY =
    verticalActual * -0.15;


  const cercanoY =
    verticalActual * -0.25;


  if (bosqueLejano) {

    bosqueLejano.style.transform = `

      translate(
        ${lejanoX}px,
        ${lejanoY}px
      )

    `;

  }


  if (bosqueMedio) {

    bosqueMedio.style.transform = `

      translate(
        ${medioX}px,
        ${medioY}px
      )

    `;

  }


  if (bosqueCercano) {

    bosqueCercano.style.transform = `

      translate(
        ${cercanoX}px,
        ${cercanoY}px
      )

    `;

  }

}


/* =========================================
   CREAR ARDILLA
========================================= */

function crearArdilla() {

  /*
  Durante el regreso
  ya no aparecen nuevas.
  */

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


    /*
    Distribución completa
    alrededor del jugador.
    */

    horizontal:
      numeroAleatorio(
        -180,
        180
      ),


    /*
    La altura ya NO es
    simplemente aleatoria.

    Forzamos arriba,
    centro o abajo.
    */

    vertical:
      elegirAltura(),


    siguiendo:
      false,

    salvada:
      false,

    perdida:
      false,

    desapareciendo:
      false

  };


  /*
  Tap en la ardilla.
  */

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
   ELEGIR ALTURA
========================================= */

function elegirAltura() {

  /*
  Elegimos una de
  tres franjas.
  */

  const zona =

    Math.floor(
      Math.random() * 3
    );


  /*
  ARRIBA
  */

  if (
    zona === 0
  ) {

    return numeroAleatorio(
      -65,
      -30
    );

  }


  /*
  CENTRO
  */

  if (
    zona === 1
  ) {

    return numeroAleatorio(
      -20,
      20
    );

  }


  /*
  ABAJO
  */

  return numeroAleatorio(
    30,
    65
  );

}


/* =========================================
   RECOGER ARDILLA
========================================= */

function recogerArdilla(
  ardilla
) {

  /*
  Durante el regreso
  ya no podemos recoger
  nuevas ardillas.
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


  /*
  La ardilla ahora
  sigue al jugador.
  */

  ardilla.siguiendo =
    true;


  /*
  Desaparece del espacio
  porque está contigo.
  */

  ardilla.elemento.style.display =
    "none";


  actualizarGrupo();


  /*
  Generamos otra ardilla
  en algún lugar del mundo.
  */

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


  /*
  Creamos exactamente
  las necesarias.
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
   ACTUALIZAR GRUPO
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
  Mostramos hasta ocho
  ardillas abajo.
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


  /*
  Si llevamos muchas,
  usamos un contador.
  */

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


  /* =====================================
     DURANTE EXPLORACIÓN
  ===================================== */

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


    const cantidad =
      siguiendo.length;


    rescatarGrupo(
      siguiendo
    );


    mensaje.textContent =

      `${cantidad} A SALVO`;


    reponerArdillas();

    return;

  }


  /* =====================================
     DURANTE REGRESO FINAL
  ===================================== */

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


    /*
    El fuego también puede
    aparecer alrededor de
    todo el jugador.
    */

    horizontal:
      numeroAleatorio(
        -180,
        180
      ),


    /*
    También distribuimos
    el fuego verticalmente.
    */

    vertical:
      elegirAltura()

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
  PROGRESO DEL INCENDIO
  */

  const progreso =

    fuegos.length /
    fuegosParaRegresar;


  /*
  Más incendio =
  más humo.
  */

  humo.style.opacity =

    Math.min(
      progreso * 0.6,
      0.6
    );


  /*
  El ambiente se vuelve
  progresivamente más cálido
  y oscuro.
  */

  if (cielo) {

    cielo.style.filter = `

      sepia(${progreso * 0.8})
      brightness(${1 - progreso * 0.35})

    `;

  }


  /*
  Revisamos inmediatamente
  si alguna ardilla fue
  alcanzada.
  */

  revisarColisiones();


  /*
  INCENDIO CRÍTICO
  */

  if (

    fuegos.length >=
    fuegosParaRegresar

  ) {

    iniciarRegreso();

    return;

  }


  /*
  Próxima llama.
  */

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


      /*
      No revisamos ardillas
      que ya están protegidas
      o eliminadas.
      */

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


          /*
          Distancia horizontal
          dentro del mundo 360°.
          */

          const distanciaX =

            Math.abs(

              normalizarAngulo(

                ardilla.horizontal -
                fuego.horizontal

              )

            );


          /*
          Distancia vertical.
          */

          const distanciaY =

            Math.abs(

              ardilla.vertical -
              fuego.vertical

            );


          /*
          Contacto.
          */

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

  /*
  Evitamos dobles conteos.
  */

  if (

    ardilla.perdida ||

    ardilla.desapareciendo ||

    ardilla.siguiendo ||

    ardilla.salvada

  ) {

    return;

  }


  /*
  Inmediatamente bloqueamos
  la ardilla.
  */

  ardilla.desapareciendo =
    true;


  ardilla.elemento.style
    .pointerEvents =
    "none";


  /*
  Esta clase CSS hace:

  normal
      ↓
  roja
      ↓
  fade
      ↓
  desaparece
  */

  ardilla.elemento.classList.add(
    "alcanzada"
  );


  /*
  IMPORTANTE:

  Este tiempo debe coincidir
  con la animación CSS:

  1.5s
  */

  setTimeout(
    () => {


      ardilla.perdida =
        true;


      ardilla.desapareciendo =
        false;


      ardilla.elemento.remove();


      /*
      Contador de pérdidas.
      */

      perdidas++;


      if (
        textoPerdidas
      ) {

        textoPerdidas.textContent =
          perdidas;

      }


      /*
      Mientras podamos seguir
      explorando, aparece
      otra ardilla.
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
  Dejamos de generar
  nuevos elementos.

  El jugador ahora sólo
  debe encontrar el agua.
  */


  /*
  Aviso grande.
  */

  alertaRegreso.style.display =
    "flex";


  mensaje.textContent =
    "";


  /*
  Dejamos el aviso visible
  dos segundos.
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
   CUENTA PARA ENCONTRAR EL AGUA
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
        Últimos tres segundos.
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
        Se acabó el tiempo.
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


  /* =====================================
     ARDILLAS
  ===================================== */

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


  /* =====================================
     FUEGOS
  ===================================== */

  fuegos.forEach(
    fuego => {

      posicionarElemento(

        fuego.elemento,

        fuego.horizontal,

        fuego.vertical

      );

    }
  );


  /* =====================================
     AGUA
  ===================================== */

  posicionarElemento(

    agua,

    posicionAgua.horizontal,

    posicionAgua.vertical

  );


  /*
  Comprobamos encuentros.
  */

  revisarColisiones();

}


/* =========================================
   POSICIONAR ELEMENTO EN 360°
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


  /*
  Distancia horizontal entre
  nuestra mirada y el objeto.
  */

  let diferenciaX =

    posicionHorizontal -
    horizontalActual;


  diferenciaX =

    normalizarAngulo(
      diferenciaX
    );


  /*
  Distancia vertical.
  */

  const diferenciaY =

    posicionVertical -
    verticalActual;


  /*
  Convertimos grados
  a posición de pantalla.
  */

  const x =

    diferenciaX /
    campoHorizontal *
    ancho;


  const y =

    diferenciaY /
    campoVertical *
    alto;


  /*
  Campo visible.
  */

  const visible =

    Math.abs(x)
      < ancho * 0.62

    &&

    Math.abs(y)
      < alto * 0.60;


  /*
  Fuera de nuestra mirada.
  */

  if (!visible) {

    elemento.style.display =
      "none";

    return;

  }


  /*
  Dentro de nuestra mirada.
  */

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
   TERMINAR
========================================= */

function terminarJuego() {

  if (!jugando) return;


  jugando =
    false;


  fase =
    "final";


  /*
  Detenemos contador.
  */

  if (
    temporizadorRegreso
  ) {

    clearInterval(
      temporizadorRegreso
    );

  }


  /*
  Ocultamos elementos
  de la fase de regreso.
  */

  if (
    cuentaRegreso
  ) {

    cuentaRegreso.style.display =
      "none";

  }


  if (
    alertaRegreso
  ) {

    alertaRegreso.style.display =
      "none";

  }


  /*
  Ya no necesitamos
  leer el sensor.
  */

  window.removeEventListener(
    "deviceorientation",
    actualizarOrientacion
  );


  /*
  Resultado.
  */

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

  /*
  Ejemplos:

  350° → -10°
  190° → -170°
  -200° → 160°
  */

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
   NÚMERO ALEATORIO
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
