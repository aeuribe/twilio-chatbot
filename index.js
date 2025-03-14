require("dotenv").config();
const express = require("express");
const twilio = require("twilio");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba para verificar que el servidor está activo
app.get("/", (req, res) => {
    res.send("🚀 API funcionando correctamente!");
  });

//Credenciales de Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

// Inicializa el cliente de Twilio
const client = twilio(accountSid, authToken);

// Objeto para guardar los estados de los usuarios
const userStates = {};

// Funcion para establecer el estado de un usuario 
function setUserState(userId, states) {
  userStates[userId] = states; // Guarda el nuevo estado del usuario
}



console.log('Definiendo la ruta /api/webhook...');

// Función para enviar mensajes con Twilio
async function sendTwilioMessage({ to, body, contentSid, contentVariables }) {
  try {
    const messageOptions = {
      from: 'whatsapp:+14155238886', // Tu número de WhatsApp configurado en Twilio
      to: to,
    };

    // Si se proporciona un template (contentSid), lo usamos
    if (contentSid) {
      messageOptions.contentSid = contentSid;

      // Si hay variables dinámicas para el template, las agregamos
      if (contentVariables) {
        messageOptions.contentVariables = JSON.stringify(contentVariables);
      }
    } else {
      // Si no hay template, enviamos un mensaje simple con "body"
      messageOptions.body = body;
    }

    // Enviar el mensaje usando Twilio
    const message = await client.messages.create(messageOptions);
    console.log(`✅ Mensaje enviado con SID: ${message.sid}`);
    return message.sid; // Retornamos el SID del mensaje enviado
  } catch (error) {
    console.error(`❌ Error al enviar el mensaje: ${error.message}`);
    throw error; // Re-lanzamos el error para manejarlo en otro lugar si es necesario
  }
}

// Tu Webhook
app.post('/api/webhook', async (req, res) => {
  console.log('Cuerpo de la solicitud:', req.body); 
  

  // Obtiene el mensaje enviado por  el usuario
  const mensajeRecibido = req.body.Body;
  console.log('Mensaje recibido:',mensajeRecibido);

  // Obtiene el numero del usuario
  const userId = req.body.From;
  const business = req.body.To;
  let respuesta = '';

  console.log('users:', userStates);
  if (!userStates[userId]) {
    userStates[userId] = { currentState: 'initial'};
  }

  console.log('userStates:',userStates[userId].currentState);
  console.log('userId:',userId);
  console.log('business:',business);
  
  switch (userStates[userId].currentState){
    case 'initial':
      // Logica para presentar opciones
      // sendTwilioMessage({
      //   to: 'whatsapp:+584242077190',
      //   contentSid: "HX243ca7c9228ef8661cee4a02f67df640", // Reemplaza con el Content SID del template para agendar citas
      // });

      setUserState(userId, { currentState:'selectingOptionFromMenu'} )
      console.log('current userState:',userStates[userId].currentState);
      console.log('usuarios:',userStates);
      
      break;

    case 'selectingOptionFromMenu':
      if (mensajeRecibido === 'option1'){
        respuesta = "Has seleccionado la opcion Agendar una Cita. Rellena este formulario para registrar tu cita!"
        console.log('respuesta:',respuesta);
        
        


          setUserState(userId, { currentState: 'booking' });
          console.log('current userState:', userStates[userId].currentState);

          console.error(`Error al obtener datos o enviar mensaje: ${error.message}`);
          res.status(500).send('Error al obtener datos o enviar mensaje');
      
  }
      break;
    
    case 'booking':
      console.log("Has seleccionado la opcion:",mensajeRecibido);
      console.log('current userState:',userStates[userId].currentState);
  }

  // switch (mensajeRecibido){
  //   case 'option1':
  //     respuesta = "Has seleccionado la opcion Agendar una Cita";
  //     sendTwilioMessage({
  //       to: 'whatsapp:+584242077190',
  //       body: respuesta// Reemplaza con el Content SID del template para agendar citas
  //     });
  //     //logica
  //     break;
  //   case 'option2':
  //     respuesta = "Has seleccionado Consultar Disponibilidad";
  //     sendTwilioMessage({
  //       to: 'whatsapp:+584242077190',
  //       body: respuesta// Reemplaza con el Content SID del template para agendar citas
  //     });
  //     break;
  //   case 'option3':
  //     respuesta = "Has seleccionado Reprogramar Cita";
  //     sendTwilioMessage({
  //       to: 'whatsapp:+584242077190',
  //       body: respuesta// Reemplaza con el Content SID del template para agendar citas
  //     });
  //     break;
  //   case 'option4':
  //     respuesta = "Has seleccionado Cancelar Cita";
  //     sendTwilioMessage({
  //       to: 'whatsapp:+584242077190',
  //       body: respuesta// Reemplaza con el Content SID del template para agendar citas
  //     });
  //     break;
  //   default:
  //     sendTwilioMessage({
  //       to: 'whatsapp:+584242077190',
  //       contentSid: "HX0922bf754951c3c70e63ed7c66b551a1", // Reemplaza con el Content SID del template para agendar citas
  //     });
      
  // }

  // // Envía la respuesta usando la API de Twilio
  // client.messages
  // .create({
  //             from: 'whatsapp:+14155238886',
  //     contentSid: 'HX0922bf754951c3c70e63ed7c66b551a1',
  //     to: 'whatsapp:+584242077190'
  // })
  //  .then(message => console.log(`Mensaje enviado con SID: ${message.sid}`))
  //  .catch(error => console.error(`Error al enviar el mensaje: ${error}`));


res.status(200).send('Mensaje recibido');

});

console.log('Ruta /api/webhook definida.');

// Manejo de rutas no encontradas
app.use((req, res) => {
    console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`); // Log de la ruta y el método
    console.log('Cabeceras de la solicitud:', req.headers); // Log de las cabeceras
  
    res.status(404).json({
      message: "❌ Ruta no encontrada",
      method: req.method,
      url: req.originalUrl,
      headers: req.headers
    });
  });
  
  // Manejo de errores generales
  app.use((err, req, res, next) => {
    console.error("❌ Error en el servidor:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  });
  
  // Iniciar servidor
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
  