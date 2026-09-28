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
   ESTADO DEL JUEGO
========================================= */

let jugando = false;

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

/*
Cantidad mínima de ardillas
disponibles en el bosque.

No significa que solamente
existan 12.

El sistema genera más.
*/

const minimoArdillas = 12;


/*
Cada cuánto aparece
una nueva llama.
*/

const intervaloFuego = 3200;


/*
Al llegar a esta cantidad
de llamas termina la partida.
*/

const maximoFuegos = 26;


/*
Campo visual aproximado.
*/

const campoHorizontal = 75;
const campoVertical = 90;


/* =========================================
   AGUA
========================================= */

const agua =
  document.createElement("button");

agua.id = "agua";

agua.innerHTML = "≋";

agua.setAttribute(
  "aria-label",
  "Zona de agua"
);

mundo.appendChild(
  agua
);


/*
Posición del agua dentro
del mundo de 360 grados.
*/

const posicionAgua = {

  horizontal: 30,

  vertical: 15

};


/* =========================================
   BOTÓN INICIAR
========================================= */

botonIniciar.addEventListener(
  "click",
  iniciarJuego
);


async function iniciarJuego() {

  /*
  iPhone / iPad necesitan
  solicitar permiso después
  de una acción del usuario.
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
        "Error solicitando orientación:",
        error
      );

      return;

    }

  }


  /*
  El primer dato del sensor
  se usa para calibrar.
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


  horizontalActual = 0;
  verticalActual = 0;


  pantallaInicio.style.display =
    "none";


  jugando = true;


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
  Escuchamos permanentemente
  el movimiento.
  */

  window.addEventListener(
    "deviceorientation",
    actualizarOrientacion
  );


  mensaje.textContent =
    "GIRA PARA BUSCAR";


  /*
  Damos unos segundos
  antes del primer incendio.
  */

  setTimeout(
    crearFuego,
    4500
  );


  dibujarMundo();

}


/* =========================================
   ORIENTACIÓN DEL TELÉFONO
========================================= */

function actualizarOrientacion(
  evento
) {

  if (!jugando) return;


  /*
  Rotación horizontal.
  */

  horizontalActual =

    normalizarAngulo(

      (evento.alpha || 0)
      - alphaOrigen

    );


  /*
  Inclinación vertical.
  */

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
  El fondo lejano se mueve poco.

  El fondo cercano se mueve más.

  Eso genera sensación
  de profundidad.
  */

  const lejanoX =
    horizontalActual * -0.25;

  const medioX =
    horizontalActual * -0.65;

  const cercanoX =
    horizontalActual * -1.25;


  /*
  Movimiento vertical
  mucho más sutil.
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


  /*
  La posicionamos inmediatamente.
  */

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

  if (

    !jugando ||

    ardilla.siguiendo ||

    ardilla.salvada ||

    ardilla.perdida ||

    ardilla.desapareciendo

  ) {

    return;

  }


  /*
  Ahora está protegida
  porque sigue al jugador.
  */

  ardilla.siguiendo =
    true;


  ardilla.elemento.style.display =
    "none";


  actualizarGrupo();


  /*
  Generamos nuevas posibilidades.
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


  /*
  Sólo contamos las ardillas
  que siguen libres en el bosque.
  */

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
  las que hacen falta.

  NO usamos while.
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
   ARDILLAS QUE SIGUEN
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
  Sólo dibujamos hasta
  ocho emojis en la interfaz.
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
  Si llevamos más,
  mostramos el resto como número.
  */

  if (
    siguiendo.length > 8
  ) {

    grupo.textContent +=

      ` +${siguiendo.length - 8}`;

  }

}


/* =========================================
   RESCATAR EN EL AGUA
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


  /*
  Llegamos al agua
  sin ninguna ardilla.
  */

  if (
    siguiendo.length === 0
  ) {

    mensaje.textContent =
      "BUSCA ARDILLAS";

    return;

  }


  /*
  Las que nos seguían
  ahora están a salvo.
  */

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
  El mundo sigue teniendo
  ardillas.
  */

  reponerArdillas();

}


/* =========================================
   CREAR FUEGO
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


  /*
  Posicionamos la llama
  inmediatamente.
  */

  posicionarElemento(

    fuego.elemento,

    fuego.horizontal,

    fuego.vertical

  );


  /*
  El incendio también modifica
  progresivamente el ambiente.
  */

  const progreso =

    fuegos.length /
    maximoFuegos;


  humo.style.opacity =

    Math.min(
      progreso * 0.6,
      0.6
    );


  /*
  El bosque se vuelve
  más oscuro y cálido.
  */

  if (cielo) {

    cielo.style.filter = `

      sepia(${progreso * 0.8})
      brightness(${1 - progreso * 0.35})

    `;

  }


  /*
  Comprobamos inmediatamente
  si esta llama apareció
  sobre alguna ardilla.
  */

  revisarColisiones();


  /*
  ¿El bosque ya está
  demasiado incendiado?
  */

  if (
    fuegos.length >=
    maximoFuegos
  ) {

    terminarJuego();

    return;

  }


  /*
  Programamos la siguiente
  llama.
  */

  setTimeout(
    crearFuego,
    intervaloFuego
  );

}


/* =========================================
   COLISIONES
   FUEGO → ARDILLA
========================================= */

function revisarColisiones() {

  if (!jugando) return;


  ardillas.forEach(
    ardilla => {


      /*
      Ignoramos ardillas
      que ya no están expuestas.
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
          Si ambos objetos están
          suficientemente cerca,
          consideramos contacto.
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
  Evitamos contar
  dos veces la misma ardilla.
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
  Marcamos inmediatamente
  el estado.

  Así otra llama no puede
  volver a activar la misma
  ardilla.
  */

  ardilla.desapareciendo =
    true;


  /*
  Ya no se puede tocar.
  */

  ardilla.elemento.style
    .pointerEvents =
    "none";


  /*
  Iniciamos la animación CSS.
  */

  ardilla.elemento.classList.add(
    "alcanzada"
  );


  /*
  Esperamos 1.2 segundos.

  Debe coincidir con la duración
  de la animación CSS.
  */

  setTimeout(
    () => {


      /*
      Si la partida terminó
      mientras ocurría el fade,
      simplemente terminamos
      la operación visual.
      */

      ardilla.perdida =
        true;


      ardilla.desapareciendo =
        false;


      ardilla.elemento.remove();


      /*
      Aumentamos el contador.
      */

      perdidas++;


      if (textoPerdidas) {

        textoPerdidas.textContent =
          perdidas;

      }


      /*
      Generamos una nueva ardilla
      mientras la partida continúe.
      */

      if (jugando) {

        reponerArdillas();

      }

    },

    1200
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
  FUEGOS
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


  /*
  Después de actualizar
  el mundo comprobamos
  los contactos.
  */

  revisarColisiones();

}


/* =========================================
   POSICIONAR ELEMENTO
   EN EL MUNDO 360
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
  Calculamos qué tan lejos
  está el objeto de la dirección
  que estamos mirando.
  */

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


  /*
  Convertimos grados
  en píxeles.
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
  Sólo mostramos elementos
  dentro del campo visual.
  */

  const visible =

    Math.abs(x)
      < ancho * 0.62

    &&

    Math.abs(y)
      < alto * 0.60;


  if (!visible) {

    elemento.style.display =
      "none";

    return;

  }


  elemento.style.display =
    "block";


  /*
  Posición respecto
  al centro de la pantalla.
  */

  elemento.style.transform = `

    translate(
      calc(-50% + ${x}px),
      calc(-50% + ${y}px)
    )

  `;

}


/* =========================================
   TERMINAR JUEGO
========================================= */

function terminarJuego() {

  if (!jugando) return;


  jugando = false;


  /*
  Dejamos de escuchar
  el sensor.
  */

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

  /*
  Convierte:

  190 → -170
  350 → -10
  -200 → 160

  Esto permite recorrer
  correctamente los 360°.
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
