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
app.post('/api/webhook', (req, res) => {
  console.log('Cuerpo de la solicitud:', req.body); 
  const mensajeRecibido = req.body.Body; // Obtiene el mensaje del usuario
  let respuesta = '';

  // switch (itemIDSeleccionado){
  //   case 'option1':
  //     respuesta = "Has seleccionado la opcion Agendar una Cita";
  //     //logica
  //     break;
  //   case 'option2':
  //     respuesta = "Has seleccionado Consultar Disponibilidad";
  //     //logica
  //     break;
  //   case 'option3':
  //     respuesta = "Has seleccionado Reprogramar Cita";
  //     //logica
  //     break;
  //   case 'option4':
  //     respuesta = "Has seleccionado Cancelar Cita";
  //     //logica
  //     break;
  //   default:
  //     respuesta = 'Opción inválida. Por favor, elige una opción válida.';
  // }

  // Envía la respuesta usando la API de Twilio
  // client.messages
  // .create({
  //             from: 'whatsapp:+14155238886',
  //     contentSid: 'HX0922bf754951c3c70e63ed7c66b551a1',
  //     to: 'whatsapp:+584242077190'
  // })
  //  .then(message => console.log(`Mensaje enviado con SID: ${message.sid}`))
  //  .catch(error => console.error(`Error al enviar el mensaje: ${error}`));

  sendTwilioMessage({
    to: 'whatsapp:+584242077190',
    contentSid: "HX0922bf754951c3c70e63ed7c66b551a1", // Reemplaza con el Content SID del template para agendar citas
  });
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
  