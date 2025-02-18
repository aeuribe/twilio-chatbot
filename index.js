require("dotenv").config();
const express = require("express");
const twilio = require("twilio");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

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
// Tu Webhook
app.post('/api/webhook', (req, res) => {
  console.log('Cuerpo de la solicitud:', req.body); // Agrega 
  const mensajeRecibido = req.body.Body; // Obtiene el mensaje del usuario
  let respuesta = '';

  if (mensajeRecibido === '1') {
    respuesta = 'Has seleccionado Agendar cita. Por favor, espera a que un agente te atienda.';
  } else if (mensajeRecibido === '2') {
    respuesta = 'Has seleccionado Consultar disponibilidad. Nuestros horarios son de Lunes a Viernes de 9am a 5pm.';
  } else if (mensajeRecibido === '3') {
    respuesta = 'Has seleccionado Cancelar cita. Por favor, proporciona el número de confirmación de tu cita.';
  } else {
    respuesta = '¡Bienvenido a nuestro servicio de gestión de citas!\n\n' +
                'Selecciona una opción:\n\n' +
                '1. Agendar cita\n' +
                '2. Consultar disponibilidad\n\n' +
                '3. Cancelar cita';
  }

  // Envía la respuesta usando la API de Twilio
  client.messages
  .create({
      to: 'whatsapp:+584242077190',
      from: 'whatsapp:+14155238886',
      body: respuesta
  })
  .then(message => console.log(`Mensaje enviado con SID: ${message.sid}`))
  .catch(error => console.error(`Error al enviar el mensaje: ${error}`));

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
  